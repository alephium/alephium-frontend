import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const useTableDetailsState = (defaultState: boolean) => {
  const [detailOpen, setDetailOpen] = useState(defaultState)

  const location = useLocation()

  // Close details when location is changing.
  useEffect(() => {
    setDetailOpen(false)
  }, [location])

  const toggleDetail = useCallback(() => setDetailOpen(!detailOpen), [detailOpen])

  return { detailOpen, setDetailOpen, toggleDetail }
}

export default useTableDetailsState
