/*
Copyright 2018 - 2022 The Alephium Authors
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

import { Wallet } from '@alephium/sdk'
import { createContext, FC, useContext, useState } from 'react'

export interface GlobalContextProps {
  wallet?: Wallet
  setWallet: (wallet: Wallet | undefined) => void
  name: string
  setName: (name: string) => void
}

export const defaults = {
  wallet: undefined,
  setWallet: () => null,
  name: '',
  setName: () => null
}

export const GlobalContext = createContext<GlobalContextProps>(defaults)

export const GlobalContextProvider: FC = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [name, setName] = useState(defaults.name)

  return <GlobalContext.Provider value={{ wallet, setWallet, name, setName }}>{children}</GlobalContext.Provider>
}

export const useGlobalContext = () => useContext(GlobalContext)
