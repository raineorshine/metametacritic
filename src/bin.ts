#!/usr/bin/env node
import { metameta } from './index.js'
import fs from 'fs/promises'
import path from 'path'
import { csv2json, json2csv } from 'json-2-csv'

const [csvPath] = process.argv.slice(2)

if (!csvPath) {
  console.error('Missing CSV path')
  process.exit(1)
}

const inputCsv = await fs.readFile(csvPath, 'utf8')
const line1 = inputCsv.slice(0, inputCsv.indexOf('\n'))
const rows = csv2json(inputCsv, {
  headerFields: line1.includes('title') && line1.includes('rating') ? undefined : ['title', 'rating'],
}) as { title: string; rating: number }[]
const userScores = rows.reduce<Record<string, number>>((accum, curr) => {
  let { title, rating } = curr
  if (!rating && title.includes(':')) {
    const parts = title.split(':')
    title = parts.slice(0, -1).join(':')
    rating = parseFloat(parts[parts.length - 1].trim())
  }
  return {
    ...accum,
    [title]: rating,
  }
}, {})

const result = await metameta(userScores)
const outputCsv = json2csv(result)
const ext = path.extname(csvPath)
const outputFile = `${csvPath.slice(0, -ext.length)}.metameta.csv`
await fs.writeFile(outputFile, outputCsv)

console.info(`${result.length} publication ratings written to ${outputFile}`)
