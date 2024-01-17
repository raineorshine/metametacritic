import fs from 'fs/promises'
import { afterEach, expect, test } from 'vitest'
import jsonMemo, { cachePath } from './json-memo.js'

afterEach(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

test('return a function with the same signature', async () => {
  const memo = await jsonMemo((name: string) => name + '!')
  const a = await memo('a')
  expect(a).toBe('a!')
})

test('do not call the function more than once for a given argument', async () => {
  let count = 0
  const memo = await jsonMemo((name: string) => {
    count++
    return name + '!'
  })

  const a = await memo('a')
  expect(a).toBe('a!')
  expect(count).toBe(1)

  const a2 = await memo('a')
  expect(a2).toBe('a!')
  expect(count).toBe(1)

  const b = await memo('b')
  expect(b).toBe('b!')
  expect(count).toBe(2)
})

test('disallow duplicate implicit cache name', async () => {
  let err
  try {
    await jsonMemo(function a(name: string) {
      return name + '1'
    })
    await jsonMemo(function a(name: string) {
      return name + '2'
    })
  } catch (e: any) {
    err = e.message
  }

  expect(err).toBe('Memoization key already exists: a. Use a named function with a different name.')
})

test('multiple args', async () => {
  const memo = await jsonMemo((a: string, b: string) => a + b)
  const ab = await memo('a', 'b')
  expect(ab).toBe('ab')
})

test('non-string arg', async () => {
  const memo = await jsonMemo((arg: { a: string }) => arg.a)
  const ab = await memo({ a: 'a' })
  expect(ab).toBe('a')
})

test('non-string return type', async () => {
  const memo = await jsonMemo((a: string) => ({ a }))
  const ab = await memo('a')
  expect(ab).toEqual({ a: 'a' })
})
