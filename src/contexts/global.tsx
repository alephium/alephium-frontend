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
import { createContext, FC, useContext, useEffect, useState } from 'react'

import { defaultSettings, loadSettings, updateStoredSettings } from '../storage/settings'
import { Settings } from '../types/settings'

type UpdateSettingsFunctionSignature = <T extends keyof Settings>(
  settingKeyToUpdate: T,
  newSettings: Partial<Settings[T]>
) => void

export interface GlobalContextProps {
  wallet?: Wallet
  setWallet: (wallet: Wallet | undefined) => void
  walletName: string
  setWalletName: (name: string) => void
  pin: string
  setPin: (pin: string) => void
  settings: Settings
  updateSettings: UpdateSettingsFunctionSignature
}

export const defaults = {
  wallet: undefined,
  setWallet: () => null,
  walletName: '',
  setWalletName: () => null,
  pin: '',
  setPin: () => null,
  settings: defaultSettings,
  updateSettings: () => null
}

export const GlobalContext = createContext<GlobalContextProps>(defaults)

export const GlobalContextProvider: FC = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet>()
  const [walletName, setWalletName] = useState(defaults.walletName)
  const [pin, setPin] = useState(defaults.pin)
  const [settings, setSettings] = useState(defaults.settings)

  const updateSettings: UpdateSettingsFunctionSignature = async (settingKeyToUpdate, newSettings) => {
    const updatedSettings = await updateStoredSettings(settingKeyToUpdate, newSettings)
    updatedSettings && setSettings(updatedSettings)
  }

  useEffect(() => {
    const getSettingsIntoState = async () => {
      const newSettings = await loadSettings()
      setSettings(newSettings)
    }

    getSettingsIntoState()
  }, [])

  return (
    <GlobalContext.Provider
      value={{ wallet, setWallet, walletName, setWalletName, pin, setPin, settings, updateSettings }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
