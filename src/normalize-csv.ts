#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { csv2json, json2csv } from 'json-2-csv'
import range from './range.js'
import minimist from 'minimist'

const options = minimist(process.argv.slice(2)) as { range?: number }

const [file] = process.argv.slice(2)

if (!file) {
  console.error('Missing file path')
  process.exit(1)
}

const csvInput = (await fs.readFile(file, 'utf8'))
  // trim trailing newlines, otherwise it will end up in the title field of the last row
  .trim()
  // convert Windows line endings to Unix, otherwise \r will end up in all title property names and values
  .replace(/\r/g, '')
const movies = csv2json(csvInput) as { title: string; rating: string }[]
const upperBound = range(movies.map(movie => movie.rating))
const moviesNormalized = movies.map(({ title, rating }) => ({
  title: title.toString().replace(/\s+\(\d{4}\)$/, ''),
  rating: (parseFloat(rating.toString()) / upperBound) * (options.range || 1),
}))
const csvOutput = json2csv(moviesNormalized, {
  excludeKeys: ['movie_id', 'imdb_id', 'tmdb_id', 'average_rating'],
  // reverse heading order to title,rating
  sortHeader: (a, b) => -a.localeCompare(b),
})
const ext = path.extname(file)
const outputFile = `${file.slice(0, -ext.length)}.normalized.csv`
await fs.writeFile(outputFile, csvOutput)

console.info(`Ratings normalized to ${outputFile}`)
