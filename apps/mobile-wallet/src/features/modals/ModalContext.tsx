import { createContext, ReactNode, useContext } from 'react'

import useModalDismiss, { UseModalDismissProps } from '~/features/modals/useModalDismiss'

interface ModalContextType {
  dismissModal: () => void
  onDismiss: () => void
}

const ModalContext = createContext<ModalContextType>({
  dismissModal: () => {},
  onDismiss: () => {}
})

interface ModalContextProviderProps extends UseModalDismissProps {
  children: ReactNode
}

const ModalContextProvider = ({ id, onUserDismiss, children }: ModalContextProviderProps) => {
  const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss })

  return <ModalContext.Provider value={{ dismissModal, onDismiss }}>{children}</ModalContext.Provider>
}

export default ModalContextProvider

export const useModalContext = () => {
  const context = useContext(ModalContext)

  if (!context) {
    throw new Error('useModalContext must be used within a ModalContextProvider')
  }

  return context
}
