import fetch from 'node-fetch'
import jsonMemo from './json-memo.js'
import range from './range.js'
import nonNull from './nonNull.js'
import pMap from 'p-map'

interface NuxtDataRaw<T> {
  data: [
    {
      content?: T
    },
  ]
}

interface NuxtSearchData {
  components: [
    {
      meta: { componentName: string }
      items: {
        slug: string
      }[]
    },
  ]
}

interface NuxtCriticReviewsData {
  components: [
    {
      meta: { componentName: string }
      items: {
        author: string
        date: string
        publicationName: string
        quote: string
        reviewedProduct: {
          type: string
          title: string
          url: string
          criticScoreSummary: {
            score: number
            url: string
          }
        }
        score: number
        url: string
      }[]
    },
  ]
}

interface Review {
  author: string
  date: string
  publicationName: string
  quote: string
  rating: number
  url: string
}

interface ReviewDiffed extends Review {
  diff: number
}

/** Scraes data from a NUXT page. */
const fetchNuxtData = async <T>(url: string): Promise<T | null> => {
  const html = await fetch(url).then(res => res.text())
  const start = html.indexOf('window.__NUXT__=') + 'window.__NUXT__='.length
  const end = html.indexOf('));</script>') + 2
  const nuxtDataRaw = eval(html.slice(start, end)) as NuxtDataRaw<T>
  return nuxtDataRaw.data[0].content || null
}

/** Round a float to a reasonable max number of decimal places, without zeros (e.g. 0.04999999999 is rounded to 0.05) */
const cleanFloat = (n: number, digits = 3): number => parseFloat(n.toFixed(digits))

/** Converts a string into a url slug, specifically the one used in metacritic urls. */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    // Remove parenthetical year, quotes, and diacritics.
    // Borrowed from modern-diacritics package.
    // See: https://github.com/Mitsunee/modern-diacritics/blob/master/src/removeDiacritics.ts
    .replace(/\p{Diacritic}|['‘’"]|\s*\(\d\d\d\d\)/gu, '')
    // replace spaces, colons, and semicolons with dashes
    // repleace multiples (e.g. colon + space) with a single dash, not one for each character
    .replace(/[ :;]+/g, '-')

/** Fetch all Metacritic reviews for the given movie (unmemoized). */
const _criticReviews = async (
  name: string,
): Promise<{
  title: string
  rating: number
  reviews: Review[]
} | null> => {
  const searchResults = await fetchNuxtData<NuxtSearchData>(
    `https://www.metacritic.com/search/${name}?page=1&category=2`,
  )

  if (!searchResults) return null

  // get the slug from the first search result
  // fall back to slugifying the name if there are no search results
  const slug =
    searchResults.components.find(component => component.meta.componentName === 'search')?.items?.[0]?.slug ||
    slugify(name)

  const content = await fetchNuxtData<NuxtCriticReviewsData>(
    `https://www.metacritic.com/movie/${slug}/critic-reviews/?sort-by=Publication%20%28A-Z%29`,
  )

  if (!content) return null

  const reviews = content.components.find(component => component.meta.componentName === 'critic-reviews')?.items

  if (!reviews) return null

  const reviewsPicked = reviews.map(review => ({
    author: review.author,
    date: review.date,
    publicationName: review.publicationName,
    quote: review.quote,
    rating: review.score / 100,
    url: review.url,
  }))

  return {
    title: reviews[0].reviewedProduct.title,
    rating: reviews[0].reviewedProduct.criticScoreSummary.score / 100,
    reviews: reviewsPicked,
  }
}

/** Fetch all Metacritic reviews for the given movie (memoized). */
export const criticReviews = await jsonMemo(_criticReviews)

/** Add a diff property to each review. Diff is equal to the difference between the critic's score and the given user's score. */
export const diff = async (reviews: Review[], userScore: number): Promise<ReviewDiffed[]> =>
  reviews.map(review => ({
    ...review,
    diff: cleanFloat(review.rating - userScore),
  }))

/** Aggregate reviews from all critics. */
export const metameta = async (
  userRatings: Record<string, string | number>,
  options: {
    /** Output range. Valid values: 1, 5, 10, 100. */
    range?: number
  } = {},
): Promise<
  {
    publicationName: string
    favor: number
    similarity: number
    reviews: number
  }[]
> => {
  const upperBound = range(Object.values(userRatings))
  // default to the user's range
  const outputUpperBound = options.range || upperBound
  const userRatingsNormalized = Object.entries(userRatings).map(([title, ratingRaw]) => ({
    title,
    rating: parseFloat(ratingRaw.toString()) / upperBound,
  }))

  const films = (
    await pMap(
      userRatingsNormalized,
      async ({ title, rating }) => {
        const criticReviewsResult = await criticReviews(title)
        if (!criticReviewsResult) {
          console.warn(`No reviews found for ${title}`)
          return null
        }
        const { reviews, rating: criticRating } = criticReviewsResult
        const reviewsDiffed = await diff(reviews, rating)
        return {
          title,
          rating: criticRating,
          reviews: reviewsDiffed,
        }
      },
      { concurrency: 8 },
    )
  ).filter(nonNull)

  // group reviews by publication
  // discard title since we are just aggregating diffs at this point
  const publicationsMap = new Map<string, ReviewDiffed[]>()
  films.forEach(({ reviews }) => {
    reviews.forEach(review => {
      if (!publicationsMap.has(review.publicationName)) {
        publicationsMap.set(review.publicationName, [])
      }
      publicationsMap.get(review.publicationName)!.push(review)
    })
  })

  const publications = Array.from(publicationsMap, ([publicationName, reviews], i) => {
    // total of all ratingr from this publication
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0)

    // total net diff measures net total difference between the critic's rating and the user's rating, indicating whether the critic was generally more or less generous than the user
    const totalNetDiff = reviews.reduce((acc, review) => acc + review.diff, 0)

    // total absolute diff measures the distance from the user's rating, regardless of whether the critic's rating was higher or lower
    const totalAbsDiff = reviews.reduce((acc, review) => acc + Math.abs(review.diff), 0)

    return {
      publicationName,
      // first divide the absolute total diff by the maximum possible diff
      // this gives the % of the maximum possible diff between the critic and the user
      // subtract from 1 to get the % similarity
      similarity: cleanFloat(1 - totalAbsDiff / reviews.length),
      // mean critic rating indicates how generous the critic was on average
      meanRating: cleanFloat((totalRating / reviews.length) * outputUpperBound),
      // reviews.length is the maximum possible difference between the critic's rating and the user's rating, i.e. the greatest distance a critic could be from the user
      favor: cleanFloat(totalNetDiff / reviews.length),
      reviews: reviews.length,
    }
  })

  return publications.sort((a, b) => b.similarity - a.similarity)
}
