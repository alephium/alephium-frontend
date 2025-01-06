/* eslint-disable @typescript-eslint/no-explicit-any */
// https://github.com/microsoft/TypeScript/issues/24929

import { useLocation } from 'react-router-dom'

const useQueryParams = <T extends string[] | string>(
  paramNames: T
): T extends string ? string | null : Record<string, string | null> => {
  const search = useLocation().search

  const params: Record<string, string | null> = {}

  if (typeof paramNames === 'string') {
    return new URLSearchParams(search).get(paramNames) as any
  } else {
    paramNames.forEach((p) => {
      params[p] = new URLSearchParams(search).get(p)
    })
    return params as any
  }
}

export default useQueryParams
