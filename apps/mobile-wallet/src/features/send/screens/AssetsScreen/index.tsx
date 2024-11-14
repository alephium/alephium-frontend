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

import { StackScreenProps } from '@react-navigation/stack'
import { orderBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import AssetRow from '~/features/send/screens/AssetsScreen/AssetRow'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
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
  const { screenScrollY, screenScrollHandler } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, address?.hash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, address?.hash))
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)

  useScrollToTopOnFocus(screenScrollY)

  const isContinueButtonDisabled = assetAmounts.length < 1

  const handleContinueButtonPress = async () => {
    setIsLoading(true)
    await buildTransaction({
      onBuildSuccess: () => navigation.navigate('VerifyScreen'),
      onConsolidationSuccess: () => navigation.navigate('ActivityScreen')
    })
    setIsLoading(false)
  }

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  if (!address) return null

  const assets = [...knownFungibleTokens, ...nfts]
  const orderedAssets = orderBy(assets, (a) => assetAmounts.find((assetWithAmount) => a.id === assetWithAmount.id))

  return (
    <>
      <FlashListScreen
        data={orderedAssets}
        keyExtractor={({ id }) => id}
        renderItem={({ item: asset, index }) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            isLast={index === orderedAssets.length - 1}
            style={{ marginHorizontal: DEFAULT_MARGIN }}
          />
        )}
        verticalGap
        contentPaddingTop
        screenTitle={t('Assets')}
        screenIntro={t('With Alephium, you can send multiple assets in one transaction.')}
        estimatedItemSize={64}
        onScroll={screenScrollHandler}
        bottomButtonsRender={() => (
          <Button
            title={t('Continue')}
            variant="highlight"
            onPress={handleContinueButtonPress}
            disabled={isContinueButtonDisabled}
          />
        )}
        {...props}
      />

      <SpinnerModal isActive={isLoading} />
    </>
  )
}

export default AssetsScreen
