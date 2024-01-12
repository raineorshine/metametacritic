Find the film critic that most closely matches your tastes.

```js
import { metameta } from 'metametacritic'

const result = await metameta({
  'May December': 20,
  'All of Us Strangers': 95,
})

/*
{
  meanScore: 89,
  favor: 0.315,
  publicationName: 'ABC News',
  reviews: 2,
  similarity: 0.635,
}
*/
```

## Output

- **meanScore** - The mean critic score that indicates how generous the publication's critics are on average.
- **favor** - The percentage that the publication rated above or below your scores on average.
- **publicationName** - The name of the publication where the reviews were published.
- **reviews** - The total number of your films that the publication has reviewed.
- **similarity** - The percentage similar that the publications scores were to your scores (regardless if they were above or below)
