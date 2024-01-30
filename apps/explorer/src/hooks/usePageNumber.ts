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
