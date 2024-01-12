import { describe, expect, test } from 'vitest'
import { criticReviews } from './index.js'

test('criticReviews', async () => {
  const result = await criticReviews('May December')

  expect(result.title).toBe('May December')
  expect(result.score).toBe(86)
  expect(result.reviews[0]).toEqual({
    author: 'Peter Travers',
    date: '2023-11-17',
    publicationName: 'ABC News',
    quote:
      'What would make a 30-ish woman have sex with a 12-year-old boy? Expect director Todd Haynes to throw you thrillingly off balance with peak acting from Julianne Moore and Charles Melton as the lovers and Natalie Portman as the actress eager to go Hollywood with their squirmy moral tale.',
    score: 88,
    url: 'https://abcnews.go.com/GMA/Culture/review-director-todd-haynes-virtuoso-walking-tightrope-humor/story?id=104914907',
  })
})
