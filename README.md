Find the film critic that most closely matches your tastes.

```js
import { metameta } from 'metametacritic'

const result = await metameta({
  'May December': 20,
  'All of Us Strangers': 95,
})

/*
{
  meanRating: 0.89,
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

# Scripts

There are some other provided scripts that may be useful:

<table>
  <tbody>
    <tr>
      <td><b>txt-to-csv</b></td>
      <td>Convert a plain text file with user ratings to csv. See <code>sample.txt</code> for a sample text file.
        <br />
        <br />
        Usage: <code>node build/txt-to-csv.js [MY_RATINGS.TXT]</code></td>
    </tr>
    <tr>
      <td><b>normalize-csv</b></td>
      <td>Normalize a csv to just title and rating. Output to *.normalized.csv. Useful when combining data from different sources. 
       <br />
       <br />
       Usage: <code>node build/normalize-csv.js [MY_RATINGS.CSV]</code></td>
    </tr>
  </tbody>
</table>
