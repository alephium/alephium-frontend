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

import { deriveNewAddressData, Wallet, walletImportAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useRef, useState } from 'react'

import Loader from '../components/Loader'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import { addressesAdded, addressesDataFetched, selectAddressByHash, selectAllAddresses } from '../store/addressesSlice'
import { getRandomLabelColor } from '../utils/colors'
import { mnemonicToSeed } from '../utils/crypto'
import AddressFormScreen, { AddressFormData } from './AddressFormScreen'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewAddressScreen'>

const NewAddressScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [masterKey, setMasterKey] = useState<Wallet['masterKey']>()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const [activeWallet, mainAddress] = useAppSelector((state) => [
    state.activeWallet,
    selectAddressByHash(state, state.addresses.mainAddress)
  ])
  const [loading, setLoading] = useState(false)

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isMain: false
  }

  useEffect(() => {
    const importWallet = async () => {
      const wallet = await walletImportAsyncUnsafe(mnemonicToSeed, activeWallet.mnemonic)
      setMasterKey(wallet.masterKey)
    }

    if (activeWallet.mnemonic) importWallet()
  }, [activeWallet.mnemonic])

  const handleGeneratePress = async ({ isMain, label, color, group }: AddressFormData) => {
    if (!masterKey) return

    setLoading(true)

    const newAddressData = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
    const addressSettings = {
      label,
      color,
      isMain
    }

    dispatch(
      addressesAdded([
        {
          hash: newAddressData.address,
          publicKey: newAddressData.publicKey,
          privateKey: newAddressData.privateKey,
          index: newAddressData.addressIndex,
          settings: addressSettings
        }
      ])
    )
    dispatch(addressesDataFetched([newAddressData.address]))

    if (activeWallet.metadataId) {
      await storeAddressMetadata(activeWallet.metadataId, {
        index: newAddressData.addressIndex,
        ...addressSettings
      })

      if (isMain && mainAddress) {
        await storeAddressMetadata(activeWallet.metadataId, {
          index: mainAddress.index,
          ...mainAddress.settings,
          isMain: false
        })
      }
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <AddressFormScreen initialValues={initialValues} onSubmit={handleGeneratePress} />
      {loading && <Loader />}
    </>
  )
}

export default NewAddressScreen
