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
  const asyncCallbackRef = useRef(asyncCallback)
  const [callbackId, setCallbackId] = useState(0)
  const [lastCompletedCallbackId, setLastCompletedCallbackId] = useState(0)

  // Update refs when props change
  useEffect(() => {
    asyncCallbackRef.current = asyncCallback
    onCancelRef.current = onCancel
    setCallbackId((prev) => prev + 1)
  }, [asyncCallback, onCancel])

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
      const data = await asyncCallbackRef.current()
      if (isPending) {
        setLastCompletedCallbackId(callbackId)
        setState((prevState) => ({ ...prevState, data, isLoading: false }))
      }
    }

    runCallback()
      .catch((error) => {
        setState((prevState) => ({ ...prevState, error }))
        if (isPending) {
          setLastCompletedCallbackId(callbackId)
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
  }, [callbackId])

  return useMemo(() => {
    if (callbackId !== lastCompletedCallbackId) {
      return { isLoading: true, data: undefined }
    }
    return state
  }, [callbackId, lastCompletedCallbackId, state])
}
