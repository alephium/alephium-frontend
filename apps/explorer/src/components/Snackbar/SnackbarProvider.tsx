import { AnimatePresence } from 'framer-motion'
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import Snackbar from './Snackbar'

export interface SnackbarMessage {
  text: string
  Icon?: ReactNode
  type?: string
  duration?: number
}

interface SnackbarContextValue {
  displaySnackbar: (message: SnackbarMessage) => void
}

export const SnackbarContext = createContext<SnackbarContextValue>({ displaySnackbar: () => null })

interface SnackbarProviderProps {
  children: ReactNode
}

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [message, setMessage] = useState<SnackbarMessage>()

  useEffect(() => {
    if (!message) return

    let timeoutId: ReturnType<typeof setTimeout>

    // Use a negative duration to make the snackbarMessage stay
    if (message.text && (!message.duration || message.duration > 0)) {
      timeoutId = setTimeout(() => setMessage(undefined), message?.duration || 3000)
    }

    return () => clearTimeout(timeoutId)
  }, [message, message?.duration])

  const displaySnackbar = useCallback((message: SnackbarMessage) => setMessage(message), [])
  const value = useMemo(() => ({ displaySnackbar }), [displaySnackbar])

  return (
    <SnackbarContext.Provider value={value}>
      {createPortal(
        <SnackbarContainer>
          <AnimatePresence>{message && <Snackbar {...message} />}</AnimatePresence>
        </SnackbarContainer>,
        document.body
      )}
      {children}
    </SnackbarContext.Provider>
  )
}

const SnackbarContainer = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 10;
`
