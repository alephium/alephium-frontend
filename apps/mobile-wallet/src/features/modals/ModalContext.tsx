import { createContext, ReactNode, useContext } from 'react'

import useModalDismiss, { UseModalDismissProps } from '~/features/modals/useModalDismiss'

interface ModalContextType {
  id: string
  dismissModal: () => void
  onDismiss: () => void
  onUserDismiss?: () => void
}

export const ModalContext = createContext<ModalContextType | null>(null)

interface ModalContextProviderProps extends UseModalDismissProps {
  children: ReactNode
}

export const ModalContextProvider = ({ id, onUserDismiss, children }: ModalContextProviderProps) => {
  const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss })

  return (
    <ModalContext.Provider value={{ id, dismissModal, onDismiss, onUserDismiss }}>{children}</ModalContext.Provider>
  )
}

export const useModalContext = () => {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error('useModalContext must be used within a ModalContextProvider')
  }

  return context
}
