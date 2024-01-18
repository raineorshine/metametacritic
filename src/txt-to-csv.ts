#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'text-block-parser'
import { json2csv } from 'json-2-csv'

const [file] = process.argv.slice(2)

if (!file) {
  console.error('Missing file path')
  process.exit(1)
}

const text = await fs.readFile(file, 'utf8')
const root = parse(text)
const movies = root[0].children
const ratings = movies.map(block => {
  const title = block.scope.replace(/\s*- /, '')
  const ratingBlock = block.children.find(child => /- \d+/.test(child.scope))
  const rating = parseInt(ratingBlock?.scope.replace(/\s*- /, '')!, 10)
  return { title, rating }
})

const csv = json2csv(ratings)
const ext = path.extname(file)
const outputFile = `${file.slice(0, -ext.length)}.csv`
await fs.writeFile(outputFile, csv)

console.info(`${ratings.length} ratings written to ${outputFile}`)
