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

import { changeActiveWallet, deriveAddressesFromStoredMetadata } from '../persistent-storage/wallets'
import { walletUnlocked } from '../store/activeWalletSlice'
import { ActiveWalletState } from '../types/wallet'
import { useAppDispatch } from './redux'

const useSwitchWallet = () => {
  const dispatch = useAppDispatch()

  const switchWallet = async (wallet: ActiveWalletState, requiresAddressInitialization: boolean, pin?: string) => {
    await changeActiveWallet(wallet.metadataId)

    const addressesToInitialize = requiresAddressInitialization
      ? await deriveAddressesFromStoredMetadata(wallet.metadataId, wallet.mnemonic)
      : undefined

    dispatch(walletUnlocked({ ...wallet, addressesToInitialize, pin }))
  }

  return switchWallet
}

export default useSwitchWallet
