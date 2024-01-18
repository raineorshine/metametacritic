#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'text-block-parser'
import { json2csv } from 'json-2-csv'

/** Returns true if a value is non null and non undefined. */
const nonNull = <T>(value: T | null | undefined): value is T => value != null

const [file] = process.argv.slice(2)

if (!file) {
  console.error('Missing file path')
  process.exit(1)
}

const text = await fs.readFile(file, 'utf8')
const root = parse(text)
const movies = root[0].children
const ratings = movies
  .map(block => {
    const title = block.scope.replace(/\s*- /, '')
    const ratingBlock = block.children.find(child => /- \d+/.test(child.scope))
    const rating = ratingBlock?.scope.replace(/\s*- /, '')
    return rating ? { title, rating } : null
  })
  .filter(nonNull)

const csv = json2csv(ratings)
const ext = path.extname(file)
const outputFile = `${file.slice(0, -ext.length)}.csv`
await fs.writeFile(outputFile, csv)

console.info(`${ratings.length} ratings written to ${outputFile}`)
