/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
