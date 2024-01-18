import fs from 'fs/promises'
import { afterAll, describe, expect, test } from 'vitest'
import { criticReviews, diff, metameta } from './index.js'
import { cachePath } from './json-memo.js'

afterAll(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

describe('criticReviews', () => {
  test('success', async () => {
    const result = (await criticReviews('All of Us Strangers'))!

    expect(result.title).toBe('All of Us Strangers')
    expect(result.score).toBe(89)
    expect(result.reviews[0]).toEqual({
      author: 'Peter Travers',
      date: '2023-12-22',
      publicationName: 'ABC News',
      quote:
        'Andrew Haigh’s enthralling ghost story concerns a screenwriter (a flawless Andrew Scott) coming to terms with a new love (Paul Mescal) and the parents (Claire Foy and Jamie Bell) who died in his childhood. Watch out for Haigh and his four superlative actors. They’ll get you good.',
      score: 90,
      url: 'https://abcnews.go.com/GMA/Culture/review-us-strangers-enthralling-gift-cinematic-hypnosis/story?id=105840158',
    })
  })

  test('invalid', async () => {
    const result = await criticReviews('thisisdefinitelynotarealmovie')
    expect(result).toBeNull()
  })
})

test('diff', async () => {
  const { reviews } = (await criticReviews('All of Us Strangers'))!
  const reviewsDiffed = await diff(reviews, 95)
  expect(reviewsDiffed[0]).toEqual({
    author: 'Peter Travers',
    date: '2023-12-22',
    diff: -5,
    publicationName: 'ABC News',
    quote:
      'Andrew Haigh’s enthralling ghost story concerns a screenwriter (a flawless Andrew Scott) coming to terms with a new love (Paul Mescal) and the parents (Claire Foy and Jamie Bell) who died in his childhood. Watch out for Haigh and his four superlative actors. They’ll get you good.',
    score: 90,
    url: 'https://abcnews.go.com/GMA/Culture/review-us-strangers-enthralling-gift-cinematic-hypnosis/story?id=105840158',
  })
})

describe('metameta', () => {
  test('0–100', async () => {
    const result = await metameta({
      'May December': 20,
      'All of Us Strangers': 95,
    })
    expect(result[0]).toEqual({
      meanScore: 100,
      favor: 0.05,
      publicationName: 'BBC',
      reviews: 1,
      similarity: 0.95,
    })
  })

  test('0–1', async () => {
    const result = await metameta({
      'May December': 0.2,
      'All of Us Strangers': 0.95,
    })
    expect(result[0]).toEqual({
      meanScore: 100,
      favor: 0.05,
      publicationName: 'BBC',
      reviews: 1,
      similarity: 0.95,
    })
  })
})
