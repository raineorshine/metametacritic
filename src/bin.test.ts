import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { afterAll, expect, test } from 'vitest'
import spawn from 'spawn-please'
import { cachePath } from './json-memo.js'

afterAll(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

test('bin', async () => {
  const inputFile = 'sample.csv'
  const outputFile = 'sample.metameta.csv'
  await fs.rm(outputFile, { force: true, recursive: true })
  await spawn('node', ['build/bin.js', inputFile])
  const output = await fs.readFile(outputFile, 'utf8')
  // just test the first five lines to avoid churn
  const firstFiveLines = output.split('\n').slice(0, 6).join('\n')
  expect(firstFiveLines).toEqual(`publicationName,meanRating,favor,similarity,reviews
BBC,1,0.05,0.95,1
Time Out,1,0.05,0.95,1
USA Today,1,0.05,0.95,1
Vox,0.9,-0.05,0.95,1
Washington Post,1,0.05,0.95,1`)
})

test('trim csv values', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'metameta-'))
  const inputFile = path.join(tempDir, 'sample.csv')
  const outputFile = path.join(tempDir, 'sample.metameta.csv')

  fs.writeFile(
    inputFile,
    `title,rating
May December, 20
All of Us Strangers, 95`,
  )

  await spawn('node', ['build/bin.js', inputFile])

  const output = await fs.readFile(outputFile, 'utf8')

  const firstFiveLines = output.split('\n').slice(0, 6).join('\n')
  expect(firstFiveLines).toEqual(`publicationName,meanRating,favor,similarity,reviews
BBC,1,0.05,0.95,1
Time Out,1,0.05,0.95,1
USA Today,1,0.05,0.95,1
Vox,0.9,-0.05,0.95,1
Washington Post,1,0.05,0.95,1`)

  await fs.rm(tempDir, { force: true, recursive: true })
})
