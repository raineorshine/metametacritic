/** Guesses the upper bound of the ratings range, either 5, 10, or 100. */
const range = (ratings: (string | number)[]) => {
  let max = 1
  const firstRating = (ratings[0]?.toString() || '').split('/')
  if (firstRating[1]) return +firstRating[1]

  for (const rating of ratings) {
    const n = parseInt(rating.toString())
    if (n > 10) {
      max = 100
      break
    } else if (max < 10 && n > 5) {
      max = 10
    } else if (max < 5 && n > 1) {
      max = 5
    }
  }

  return max
}

export default range
