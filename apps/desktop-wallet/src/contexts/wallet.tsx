import { resetArray } from '@alephium/shared/utils'
import { createContext, useContext, useState } from 'react'

import { CenteredSection } from '@/components/PageComponents/PageContainers'

export interface WalletContextType {
  mnemonic: Uint8Array | null
  setMnemonic: (mnemonic: Uint8Array | null) => void
  resetCachedMnemonic: () => void
}

const initialWalletContext: WalletContextType = {
  mnemonic: null,
  setMnemonic: () => null,
  resetCachedMnemonic: () => null
}

const WalletContext = createContext<WalletContextType>(initialWalletContext)

export const WalletContextProvider: FC = ({ children }) => {
  const [mnemonic, setMnemonic] = useState<WalletContextType['mnemonic']>(null)

  const resetCachedMnemonic = () => {
    setMnemonic((prevValue) => {
      if (prevValue) resetArray(prevValue)

      return null
    })
  }

  return (
    <WalletContext.Provider value={{ mnemonic, setMnemonic, resetCachedMnemonic }}>
      <CenteredSection>{children}</CenteredSection>
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => useContext(WalletContext)
