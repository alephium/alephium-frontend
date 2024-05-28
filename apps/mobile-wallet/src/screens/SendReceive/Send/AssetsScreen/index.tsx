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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useMemo } from 'react'

import { BackButton, ContinueButton } from '~/components/buttons/Button'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import AssetRow from '~/screens/SendReceive/Send/AssetsScreen/AssetRow'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  selectAddressByHash
} from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'>,
    Omit<ScrollScreenProps, 'contentContainerStyle'> {}

const AssetsScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, assetAmounts, buildTransaction, setToAddress } = useSendContext()
  const { setHeaderOptions, screenScrollY } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, address?.hash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, address?.hash))

  useScrollToTopOnFocus(screenScrollY)

  const isContinueButtonDisabled = assetAmounts.length < 1

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        headerRight: () => (
          <ContinueButton
            onPress={() =>
              buildTransaction({
                onBuildSuccess: () => navigation.navigate('VerifyScreen'),
                onConsolidationSuccess: () => navigation.navigate('TransfersScreen')
              })
            }
            disabled={isContinueButtonDisabled}
          />
        )
      })
    }, [buildTransaction, isContinueButtonDisabled, navigation, setHeaderOptions])
  )

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  if (!address) return null

  const assets = [...knownFungibleTokens, ...nfts]

  return (
    <FlashListScreen
      data={assets}
      keyExtractor={({ id }) => id}
      renderItem={({ item: asset, index }) => (
        <AssetRow key={asset.id} asset={asset} isLast={index === assets.length - 1} />
      )}
      verticalGap
      usesKeyboard
      contrastedBg
      contentPaddingTop
      keyboardShouldPersistTaps="always"
      screenTitle="Assets"
      screenIntro="With Alephium, you can send multiple assets in one transaction."
      contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN }}
      estimatedItemSize={64}
      {...props}
    />
  )
}

export default AssetsScreen
