# Explorer homepage query refresh

The homepage uses the same TanStack Query client and API factory convention as the other explorer pages.

- Heights, average block time, supply and transaction totals refresh every 10 seconds while visible.
- The first block page refreshes every 5 seconds, preserving the current backend indexing cadence. Other pages fetch on navigation; previous page data remains visible during the request. Only arrivals on page 1 flash as new blocks.
- Chart keys include the interval and minute-floored range from `timeIntervals.ts`. A lightweight visible-page ticker advances the bucket; chart queries have no polling interval. Viewers in the same minute request identical URLs. Returning to the page uses the current bucket directly.
- Query functions forward the cancellation signal to the API client. Shared keys deduplicate concurrent consumers; selectors derive scalar values and sparkline series from cached responses.
- Zero and empty results complete normally. Initial pending results show existing skeletons; errors stop the skeleton and retain cached values when available, or the existing empty placeholder otherwise.

`useHomePageQueries.test.ts` exercises cadence, deduplication, visibility, interval switching, pagination retention, zero results and errors. `timeIntervals.test.ts` checks identical minute URLs and UTC boundaries.
