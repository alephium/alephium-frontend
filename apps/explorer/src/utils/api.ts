/* eslint-disable @typescript-eslint/no-explicit-any */

export const browsePages = async <T, R>(
  callback: (arg: T, options: { limit: number; page: number }) => Promise<R[]>,
  callbackFirstArg: T,
  pageLimit: number
): Promise<R[]> => {
  let pageTotalResults
  let page = 1

  const results = []

  while (pageTotalResults === undefined || pageTotalResults === pageLimit) {
    const pageResults = await callback(callbackFirstArg, { limit: pageLimit, page })

    results.push(...pageResults)

    pageTotalResults = pageResults.length
    page += 1
  }

  return results
}
