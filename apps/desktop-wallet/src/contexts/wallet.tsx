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

import { createContext, useContext, useState } from 'react'

import { CenteredSection } from '@/components/PageComponents/PageContainers'

export interface WalletContextType {
  mnemonic: Uint8Array | null
  setMnemonic: (mnemonic: Uint8Array | null) => void
}

export const initialWalletContext: WalletContextType = {
  mnemonic: null,
  setMnemonic: () => null
}

export const WalletContext = createContext<WalletContextType>(initialWalletContext)

export const WalletContextProvider: FC = ({ children }) => {
  const [mnemonic, setMnemonic] = useState<WalletContextType['mnemonic']>(null)

  return (
    <WalletContext.Provider value={{ mnemonic, setMnemonic }}>
      <CenteredSection>{children}</CenteredSection>
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => useContext(WalletContext)
