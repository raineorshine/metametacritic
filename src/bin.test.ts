import fs from 'fs/promises'
import { afterAll, expect, test } from 'vitest'
import spawn from 'spawn-please'
import { cachePath } from './json-memo.js'

afterAll(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

test('bin', async () => {
  const outputFile = 'sample.metameta.csv'
  await fs.rm(outputFile, { force: true, recursive: true })
  await spawn('node', ['build/bin.js', 'sample.csv'])
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
