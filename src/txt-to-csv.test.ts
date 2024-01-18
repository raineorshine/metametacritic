import fs from 'fs/promises'
import os from 'os'
import { afterAll, expect, test } from 'vitest'
import spawn from 'spawn-please'
import { cachePath } from './json-memo.js'
import path from 'path'

afterAll(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

test('txt-to-csv', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'metameta-'))
  const sampleFile = 'sample.txt'
  const inputFile = path.join(tempDir, sampleFile)
  fs.copyFile(sampleFile, inputFile)

  await spawn('node', ['build/txt-to-csv.js', inputFile])

  const outputFile = path.join(tempDir, 'sample.csv')
  const output = await fs.readFile(outputFile, 'utf8')

  expect(output).toBe(`title,rating
May December,20
All of Us Strangers,95`)

  await fs.rm(tempDir, { force: true, recursive: true })
})
