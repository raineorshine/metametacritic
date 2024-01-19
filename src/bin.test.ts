import fs from 'fs/promises'
import { afterAll, expect, test } from 'vitest'
import spawn from 'spawn-please'
import { cachePath } from './json-memo.js'

afterAll(async () => {
  await fs.rm(cachePath, { force: true, recursive: true })
})

test('metameta', async () => {
  const outputFile = 'sample.metameta.csv'
  await fs.rm(outputFile, { force: true, recursive: true })
  await spawn('node', ['build/bin.js', 'sample.csv'])
  const output = await fs.readFile(outputFile, 'utf8')
  // just test the first five lines to avoid churn
  const firstFiveLines = output.split('\n').slice(0, 6).join('\n')
  expect(firstFiveLines).toEqual(`publicationName,meanScore,favor,similarity,reviews
BBC,100,0.05,0.95,1
Time Out,100,0.05,0.95,1
USA Today,100,0.05,0.95,1
Vox,90,-0.05,0.95,1
Washington Post,100,0.05,0.95,1`)
})
