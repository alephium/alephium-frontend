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

import { deriveNewAddressData, walletImportAsyncUnsafe } from '@alephium/sdk'
import { useCallback, useEffect, useRef } from 'react'

import { getAddressesMetadataByWalletId } from '../storage/wallets'
import { addressesAdded, addressesFlushed, fetchAddressesData } from '../store/addressesSlice'
import { Mnemonic } from '../types/wallet'
import { mnemonicToSeed } from '../utils/crypto'
import { useAppDispatch, useAppSelector } from './redux'

const useLoadStoredAddressesMetadata = () => {
  const dispatch = useAppDispatch()
  const [activeWallet, networkSettings, addressIds] = useAppSelector((s) => [
    s.activeWallet,
    s.network.settings,
    s.addresses.ids
  ])

  const currentActiveWalletMnemonic = useRef<Mnemonic>(activeWallet.mnemonic)
  const currentNodeHost = useRef<string>(networkSettings.nodeHost)
  const currentExplorerApiHost = useRef<string>(networkSettings.explorerApiHost)

  const isAddressesStateEmpty = addressIds.length === 0

  const initializeAddressesState = useCallback(async () => {
    if (activeWallet.metadataId && activeWallet.mnemonic) {
      console.log('👀 Found addresses metadata in persistent storage')

      const wallet = await walletImportAsyncUnsafe(mnemonicToSeed, activeWallet.mnemonic)
      const addressesMetadata = await getAddressesMetadataByWalletId(activeWallet.metadataId)

      const addresses = addressesMetadata.map(({ index, ...settings }) => {
        const { address, publicKey, privateKey } = deriveNewAddressData(wallet.seed, undefined, index)
        return { hash: address, publicKey, privateKey, index, settings }
      })

      dispatch(addressesAdded(addresses))
      dispatch(fetchAddressesData(addresses.map((address) => address.hash)))
    }
  }, [activeWallet.metadataId, activeWallet.mnemonic, dispatch])

  useEffect(() => {
    if (activeWallet.mnemonic && currentActiveWalletMnemonic.current != activeWallet.mnemonic) {
      if (!isAddressesStateEmpty) dispatch(addressesFlushed())
      initializeAddressesState()
      currentActiveWalletMnemonic.current = activeWallet.mnemonic
    }
  }, [activeWallet.mnemonic, dispatch, initializeAddressesState, isAddressesStateEmpty])

  useEffect(() => {
    if (
      currentNodeHost.current !== networkSettings.nodeHost ||
      currentExplorerApiHost.current !== networkSettings.explorerApiHost
    ) {
      if (!isAddressesStateEmpty) dispatch(addressesFlushed())
      initializeAddressesState()
      currentNodeHost.current = networkSettings.nodeHost
      currentExplorerApiHost.current = networkSettings.explorerApiHost
    }
  }, [
    dispatch,
    initializeAddressesState,
    isAddressesStateEmpty,
    networkSettings.explorerApiHost,
    networkSettings.nodeHost
  ])
}

export default useLoadStoredAddressesMetadata
