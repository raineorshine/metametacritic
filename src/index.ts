import fetch from 'node-fetch'

interface NuxtData {
  data: [
    {
      content: {
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

/** Fetch all Metacritic reviews for the given movie. */
export const criticReviews = async (name: string) => {
  const slug = name.toLowerCase().replace(/ /g, '-')
  const url = `https://www.metacritic.com/movie/${slug}/critic-reviews/?sort-by=Publication%20%28A-Z%29`

  const html = await fetch(url).then(res => res.text())
  const start = html.indexOf('window.__NUXT__=') + 'window.__NUXT__='.length
  const end = html.indexOf('));</script>') + 2
  const json: NuxtData = eval(html.slice(start, end))
  const componentData = json.data[0].content.components
  const reviews = componentData.find(component => component.meta.componentName === 'critic-reviews')?.items || []
  const reviewsPicked = reviews.map(review => ({
    author: review.author,
    date: review.date,
    publicationName: review.publicationName,
    quote: review.quote,
    score: review.score,
    url: review.url,
  }))

  return {
    title: reviews[0].reviewedProduct.title,
    score: reviews[0].reviewedProduct.criticScoreSummary.score,
    reviews: reviewsPicked,
  }
}
