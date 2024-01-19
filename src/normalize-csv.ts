#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { csv2json, json2csv } from 'json-2-csv'

const [file] = process.argv.slice(2)

if (!file) {
  console.error('Missing file path')
  process.exit(1)
}

const csvInput = await fs.readFile(file, 'utf8')
const json = csv2json(csvInput)
const csvOutput = json2csv(json, {
  excludeKeys: ['movie_id', 'imdb_id', 'tmdb_id', 'average_rating'],
  // reverse heading order to title,rating
  sortHeader: (a, b) => -a.localeCompare(b),
})
const ext = path.extname(file)
const outputFile = `${file.slice(0, -ext.length)}.normalized.csv`
await fs.writeFile(outputFile, csvOutput)

console.info(`Ratings normalized to ${outputFile}`)
