import fs from 'fs/promises'
import path from 'path'
import murmurHash3 from 'murmurhash3js'

/** The path of the cache directory that persists critic reviews. */
export const cachePath = '.json-memo'

/** A set of used cache keys. Used to detect duplicate implicit keys. */
const keySet = new Set<string>()

/** Returns a memoized function that caches memoized results to a json file in the cachePath. */
async function jsonMemo<A extends unknown[], R>(f: (...args: A) => R | Promise<R>) {
  // if the function does not have a name, use a hash of the function body as the key
  const key = f.name || murmurHash3.x64.hash128(f.toString())

  if (keySet.has(key)) {
    throw new Error(`Memoization key already exists: ${key}. Use a named function with a different name.`)
  } else {
    keySet.add(key)
  }

  const memo = async (...args: A) => {
    const file = path.join(cachePath, `${key}-${args.join('\x01')}.json`)

    let value: R | undefined

    try {
      const str = await fs.readFile(file, 'utf8')
      value = JSON.parse(str)
    } catch (e) {
      // ignore
    }

    if (value === undefined) {
      value = await f(...args)
      const s = JSON.stringify(value)
      await fs.mkdir(cachePath, { recursive: true })
      await fs.writeFile(file, s)
    }

    return value
  }

  return memo
}

export default jsonMemo
