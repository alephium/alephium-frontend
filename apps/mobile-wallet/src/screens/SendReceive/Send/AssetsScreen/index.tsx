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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components/native'

import { BackButton, ContinueButton } from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
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

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'>, ScrollScreenProps {}

const AssetsScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, assetAmounts, buildTransaction, setToAddress } = useSendContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, address?.hash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, address?.hash))

  useScrollToTopOnFocus()

  const isContinueButtonDisabled = assetAmounts.length < 1

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
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
    }, [buildTransaction, isContinueButtonDisabled, navigation])
  )

  if (!address) return null

  return (
    <ScrollScreen
      hasNavigationHeader
      verticalGap
      usesKeyboard
      contrastedBg
      keyboardShouldPersistTaps="always"
      {...props}
    >
      <ScreenIntro title="Assets" subtitle="With Alephium, you can send multiple assets in one transaction." />
      <ScreenSection>
        <AssetsList>
          {knownFungibleTokens.map((asset, index) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              isLast={index === knownFungibleTokens.length - 1 && nfts.length === 0}
            />
          ))}
          {nfts.map((nft, index) => (
            <AssetRow key={nft.id} asset={nft} isLast={index === nfts.length - 1} />
          ))}
        </AssetsList>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default AssetsScreen

const AssetsList = styled.View``
