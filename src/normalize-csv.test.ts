import fs from 'fs/promises'
import os from 'os'
import { expect, test } from 'vitest'
import spawn from 'spawn-please'
import path from 'path'

test('normalize-csv', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'metameta-'))
  const sampleFile = 'sample.txt'
  const inputFile = path.join(tempDir, sampleFile)
  fs.writeFile(
    inputFile,
    `movie_id,imdb_id,tmdb_id,rating,average_rating,title
    527,0108052,424,4.5,4.23941,Schindler's List (1993)
    1214,0078748,348,3.0,4.06974,Alien (1979)
    1272,0066206,11202,2.5,3.99349,Patton (1970)`,
  )

  await spawn('node', ['build/normalize-csv.js', inputFile])

  const outputFile = path.join(tempDir, 'sample.normalized.csv')
  const output = await fs.readFile(outputFile, 'utf8')

  expect(output).toBe(`title,rating
Schindler's List,0.9
Alien,0.6
Patton,0.5`)

  await fs.rm(tempDir, { force: true, recursive: true })
})
