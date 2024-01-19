import fetch from 'node-fetch'
import jsonMemo from './json-memo.js'

interface NuxtData {
  data: [
    {
      content?: {
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
    },
  ]
}

interface Review {
  author: string
  date: string
  publicationName: string
  quote: string
  score: number
  url: string
}

interface ReviewDiffed extends Review {
  diff: number
}

/** Round a float to a reasonable max number of decimal places, without zeros (e.g. 0.04999999999 is rounded to 0.05) */
const cleanFloat = (n: number, digits = 6): number => parseFloat(n.toFixed(digits))

/** Fetch all Metacritic reviews for the given movie (unmemoized). */
const _criticReviews = async (
  name: string,
): Promise<{
  title: string
  score: number
  reviews: Review[]
} | null> => {
  const slug = name
    .toLowerCase()
    // remove parenthetical year
    .replace(/\s*\(\d\d\d\d\)/, '')
    // replace spaces with dashes
    .replace(/ /g, '-')
  const url = `https://www.metacritic.com/movie/${slug}/critic-reviews/?sort-by=Publication%20%28A-Z%29`

  const html = await fetch(url).then(res => res.text())
  const start = html.indexOf('window.__NUXT__=') + 'window.__NUXT__='.length
  const end = html.indexOf('));</script>') + 2
  const json: NuxtData = eval(html.slice(start, end))
  const content = json.data[0].content

  if (!content) return null

  const reviews = content.components.find(component => component.meta.componentName === 'critic-reviews')?.items || []
  const reviewsPicked = reviews.map(review => ({
    author: review.author,
    date: review.date,
    publicationName: review.publicationName,
    quote: review.quote,
    score: review.score / 100,
    url: review.url,
  }))

  return {
    title: reviews[0].reviewedProduct.title,
    score: reviews[0].reviewedProduct.criticScoreSummary.score / 100,
    reviews: reviewsPicked,
  }
}

/** Fetch all Metacritic reviews for the given movie (memoized). */
export const criticReviews = await jsonMemo(_criticReviews)

/** Add a diff property to each review. Diff is equal to the difference between the critic's score and the given user's score. */
export const diff = async (reviews: Review[], userScore: number): Promise<ReviewDiffed[]> =>
  reviews.map(review => ({
    ...review,
    diff: cleanFloat(review.score - userScore),
  }))

/** Aggregate reviews from all critics. */
export const metameta = async (
  userScores: Record<string, string | number>,
): Promise<
  {
    publicationName: string
    favor: number
    similarity: number
    reviews: number
  }[]
> => {
  /** True if the score is in the range 0–100 as opposed to 0–1. */
  const isScoreOf100 = Object.values(userScores).some(rating => parseInt(rating.toString()) > 1)

  const userScoresNormalized = Object.entries(userScores).map(([title, ratingRaw]) => {
    const [rating, maxRating] = typeof ratingRaw === 'string' ? ratingRaw.split('/').map(n => +n) : [ratingRaw]
    const ratingNormalized = maxRating ? rating / maxRating : isScoreOf100 ? rating / 100 : rating
    return { title, rating: ratingNormalized }
  })

  const films = await Promise.all(
    userScoresNormalized.map(async ({ title, rating }) => {
      const { reviews, score } = (await criticReviews(title))!
      const reviewsDiffed = await diff(reviews, rating)
      return {
        title,
        score,
        reviews: reviewsDiffed,
      }
    }),
  )

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
    // total of all scores from this publication
    const totalScore = reviews.reduce((acc, review) => acc + review.score, 0)

    // total net diff measures net total difference between the critic's score and the user's score, indicating whether the critic was generally more or less generous than the user
    const totalNetDiff = reviews.reduce((acc, review) => acc + review.diff, 0)

    // total absolute diff measures the distance from the user's score, regardless of whether the critic's score was higher or lower
    const totalAbsDiff = reviews.reduce((acc, review) => acc + Math.abs(review.diff), 0)

    return {
      publicationName,
      // mean critic score indicates how generous the critic was on average
      meanScore: cleanFloat(totalScore / reviews.length),
      // reviews.length is the maximum possible difference between the critic's score and the user's score, i.e. the greatest distance a critic could be from the user
      favor: cleanFloat(totalNetDiff / reviews.length),
      // first divide the absolute total diff by the maximum possible diff
      // this gives the % of the maximum possible diff between the critic and the user
      // subtract from 1 to get the % similarity
      similarity: cleanFloat(1 - totalAbsDiff / reviews.length),
      reviews: reviews.length,
    }
  })

  return publications.sort((a, b) => b.similarity - a.similarity)
}
