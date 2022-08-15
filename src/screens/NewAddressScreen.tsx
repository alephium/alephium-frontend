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
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useRef, useState } from 'react'

import Loader from '../components/Loader'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import {
  addressesAdded,
  fetchAddressConfirmedTransactions,
  fetchAddressesData,
  selectAddressByHash,
  selectAllAddresses
} from '../store/addressesSlice'
import { getRandomLabelColor } from '../utils/colors'
import { mnemonicToSeed } from '../utils/crypto'
import AddressFormScreen from './AddressFormScreen'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewAddressScreen'>

const NewAddressScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [seed, setSeed] = useState<Buffer>()
  const addresses = useAppSelector(selectAllAddresses)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const mainAddressHash = useAppSelector((state) => state.addresses.mainAddress)
  const mainAddress = useAppSelector((state) => selectAddressByHash(state, mainAddressHash))
  const [loading, setLoading] = useState(false)

  const initialValues = {
    label: '',
    color: getRandomLabelColor(),
    isMain: false
  }

  useEffect(() => {
    const importWallet = async () => {
      const wallet = await walletImportAsyncUnsafe(mnemonicToSeed, activeWallet.mnemonic)
      setSeed(wallet.seed)
    }

    importWallet()
  }, [activeWallet.mnemonic])

  const handleGeneratePress = async (isMain: boolean, label?: string, color?: string, group?: number) => {
    if (!seed) return

    setLoading(true)

    const newAddressData = deriveNewAddressData(seed, group, undefined, currentAddressIndexes.current)
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
    dispatch(fetchAddressesData([newAddressData.address]))
    dispatch(fetchAddressConfirmedTransactions({ hash: newAddressData.address, page: 1 }))

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
