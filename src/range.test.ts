import { expect, test } from 'vitest'
import range from './range.js'

test('explicit range', async () => {
  const ratings = ['4.5/5', '3/5', '2.5/5']
  expect(range(ratings)).toBe(5)
})

test('0–5', async () => {
  const ratings = ['4.5', '3', '2.5']
  expect(range(ratings)).toBe(5)
})

test('0–10', async () => {
  const ratings = ['9', '6', '5']
  expect(range(ratings)).toBe(10)
})

test('0–100', async () => {
  const ratings = ['90', '60', '50']
  expect(range(ratings)).toBe(100)
})

test('numbers', async () => {
  const ratings = [90, 60, 50]
  expect(range(ratings)).toBe(100)
})
