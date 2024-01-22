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
    expect(result.rating).toBe(0.89)
    expect(result.reviews[0]).toEqual({
      author: 'Peter Travers',
      date: '2023-12-22',
      publicationName: 'ABC News',
      quote:
        'Andrew Haigh’s enthralling ghost story concerns a screenwriter (a flawless Andrew Scott) coming to terms with a new love (Paul Mescal) and the parents (Claire Foy and Jamie Bell) who died in his childhood. Watch out for Haigh and his four superlative actors. They’ll get you good.',
      rating: 0.9,
      url: 'https://abcnews.go.com/GMA/Culture/review-us-strangers-enthralling-gift-cinematic-hypnosis/story?id=105840158',
    })
  })

  test('ignore paranthetical year', async () => {
    const result = (await criticReviews('All of Us Strangers (2023)'))!

    expect(result.title).toBe('All of Us Strangers')
    expect(result.rating).toBe(0.89)
    expect(result.reviews[0]).toEqual({
      author: 'Peter Travers',
      date: '2023-12-22',
      publicationName: 'ABC News',
      quote:
        'Andrew Haigh’s enthralling ghost story concerns a screenwriter (a flawless Andrew Scott) coming to terms with a new love (Paul Mescal) and the parents (Claire Foy and Jamie Bell) who died in his childhood. Watch out for Haigh and his four superlative actors. They’ll get you good.',
      rating: 0.9,
      url: 'https://abcnews.go.com/GMA/Culture/review-us-strangers-enthralling-gift-cinematic-hypnosis/story?id=105840158',
    })
  })

  test('invalid', async () => {
    const result = await criticReviews('thisisdefinitelynotarealmovie')
    expect(result).toBeNull()
  })

  test('curly quote in title', async () => {
    // user review with curly quote
    const result = (await criticReviews(`Jodorowsky’s Dune`))!
    // title that comes back from metacritic is a straight quote
    expect(result.title).toBe(`Jodorowsky's Dune`)
    expect(result.rating).toBe(0.79)
  })

  test('single quote in title', async () => {
    const result = (await criticReviews(`Jodorowsky's Dune`))!
    expect(result.title).toBe(`Jodorowsky's Dune`)
    expect(result.rating).toBe(0.79)
  })

  test('colon in title', async () => {
    const result = (await criticReviews('Spider-Man: Across the Spider-Verse'))!
    expect(result.title).toBe('Spider-Man: Across the Spider-Verse')
    expect(result.rating).toBe(0.86)
  })

  test('utf-8 char in title', async () => {
    const result = (await criticReviews('Moolaadé'))!
    expect(result.title).toBe('Moolaadé')
    expect(result.rating).toBe(0.91)
  })

  test('find a film that use a title-year url', async () => {
    const result = (await criticReviews('Alien'))!

    expect(result.title).toBe('Alien')
    expect(result.rating).toBe(0.89)
    expect(result.reviews[0]).toEqual({
      author: 'Chris Kaltenbach',
      date: '',
      publicationName: 'Baltimore Sun',
      quote: `Alien, even with some scene tinkering that has left this "director's cut" one minute shorter than its original release, is still one of the creepiest, scariest, most shocking films ever.`,
      rating: 0.88,
      url: 'http://www.sunspot.net/entertainment/movies/bal-to.alien29oct29,0,216502.story?coll=bal-artslife-movies',
    })
  })
})

test('diff', async () => {
  const { reviews } = (await criticReviews('All of Us Strangers'))!
  const reviewsDiffed = await diff(reviews, 0.95)
  expect(reviewsDiffed[0]).toEqual({
    author: 'Peter Travers',
    date: '2023-12-22',
    diff: -0.05,
    publicationName: 'ABC News',
    quote:
      'Andrew Haigh’s enthralling ghost story concerns a screenwriter (a flawless Andrew Scott) coming to terms with a new love (Paul Mescal) and the parents (Claire Foy and Jamie Bell) who died in his childhood. Watch out for Haigh and his four superlative actors. They’ll get you good.',
    rating: 0.9,
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
      meanRating: 1,
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
      meanRating: 1,
      favor: 0.05,
      publicationName: 'BBC',
      reviews: 1,
      similarity: 0.95,
    })
  })

  test('0–5/5', async () => {
    const result = await metameta({
      'May December': '1/5',
      'All of Us Strangers': '4.75/5',
    })
    expect(result[0]).toEqual({
      meanRating: 1,
      favor: 0.05,
      publicationName: 'BBC',
      reviews: 1,
      similarity: 0.95,
    })
  })
})
