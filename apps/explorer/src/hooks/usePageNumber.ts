import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import useQueryParams from './useQueryParams'

const usePageNumber = () => {
  const pageParam = useQueryParams('p')
  const pageNumber = pageParam && parseInt(pageParam)
  const location = useLocation()
  const navigate = useNavigate()

  const locationSearch = useMemo(() => new URLSearchParams(location.search), [location.search])

  if (pageNumber === 1) {
    locationSearch.delete('p')
    navigate({ search: locationSearch.toString() })
  }

  return pageNumber || 1
}

export default usePageNumber
