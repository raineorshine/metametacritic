Find the film critic that most closely matches your tastes.

```js
import { metameta } from 'metametacritic'

const result = await metameta({
  'May December': 20,
  'All of Us Strangers': 95,
})

/*
{
  meanRating: 89,
  favor: 0.315,
  publicationName: 'ABC News',
  reviews: 2,
  similarity: 0.635,
}
*/
```

## Output

- **meanRating** - The mean critic rating that indicates how generous the publication's critics are on average.
- **favor** - The percentage that the publication rated above or below your ratings on average.
- **publicationName** - The name of the publication where the reviews were published.
- **reviews** - The total number of your films that the publication has reviewed.
- **similarity** - The percentage similar that the publications ratings were to your ratings (regardless if they were above or below)
