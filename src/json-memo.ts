import fs from 'fs/promises'
import path from 'path'

/** The path of the cache directory that persists critic reviews. */
export const cachePath = '.json-memo'

/** A set of used cache keys. Used to detect duplicate implicit keys. */
const keySet = new Set<string>()

/** Returns true if a file exists. */
const exists = (path: string) =>
  fs.stat(path).then(
    () => true,
    () => false,
  )

/** Returns a memoized function that caches memoized results to a json file in the cachePath. */
async function jsonMemo<A extends unknown[], R>(f: (...args: A) => R | Promise<R>) {
  const key = f.name || f.toString()
  if (keySet.has(key)) {
    throw new Error(`Memoization key already exists: ${key}. Use a named function with a different name.`)
  } else {
    keySet.add(key)
  }

  if (!(await exists(cachePath))) {
    await fs.mkdir(cachePath)
  }

  /** Gets the path of the cache file for the given argument. */
  const valPath = (...args: A) => path.join(cachePath, `${key}-${args.join('\x01')}.json`)

  const memo = async (...args: A) => {
    const file = valPath(...args)
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
      await fs.writeFile(file, s)
    }

    return value
  }

  return memo
}

export default jsonMemo
