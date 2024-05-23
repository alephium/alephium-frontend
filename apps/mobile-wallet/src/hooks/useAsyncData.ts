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

import { useEffect, useMemo, useRef, useState } from 'react'

// Whole file imported from Uniswap

// adapted from https://usehooks.com/useAsync/ but simplified
// above link contains example on how to add delayed execution if ever needed
export function useAsyncData<T>(
  asyncCallback: () => Promise<T> | undefined,
  onCancel?: () => void
): {
  isLoading: boolean
  data: T | undefined
  error?: Error
} {
  const [state, setState] = useState<{
    data: T | undefined
    isLoading: boolean
    error?: Error
  }>({
    data: undefined,
    isLoading: true,
    error: undefined
  })
  const onCancelRef = useRef(onCancel)
  const lastCompletedAsyncCallbackRef = useRef(asyncCallback)

  useEffect(() => {
    let isPending = false

    async function runCallback(): Promise<void> {
      isPending = true
      setState((prevState) => {
        if (!prevState.error) {
          // Return the same state to avoid an unneeded re-render.
          return prevState
        }
        return { ...prevState, error: undefined }
      })
      const data = await asyncCallback()
      if (isPending) {
        lastCompletedAsyncCallbackRef.current = asyncCallback
        setState((prevState) => ({ ...prevState, data, isLoading: false }))
      }
    }

    runCallback()
      .catch((error) => {
        setState((prevState) => ({ ...prevState, error }))
        if (isPending) {
          lastCompletedAsyncCallbackRef.current = asyncCallback
          setState((prevState) => ({ ...prevState, isLoading: false }))
        }
      })
      .finally(() => {
        isPending = false
      })

    const handleCancel = onCancelRef.current

    return () => {
      if (!isPending) {
        return
      }
      isPending = false
      if (handleCancel) {
        handleCancel()
      }
    }
  }, [asyncCallback])

  return useMemo(() => {
    if (asyncCallback !== lastCompletedAsyncCallbackRef.current) {
      return { isLoading: true, data: undefined }
    }
    return state
  }, [asyncCallback, state])
}
