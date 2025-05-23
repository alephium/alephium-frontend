import { StackScreenProps } from '@react-navigation/stack'
import { orderBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import AssetRow from '~/features/send/screens/AssetsScreen/AssetRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  makeSelectAddressesUnknownTokens,
  selectAddressByHash
} from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

interface ScreenProps
  extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'>,
    Omit<ScrollScreenProps, 'contentContainerStyle'> {}

const AssetsScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, assetAmounts, buildTransaction, setAssetAmount } = useSendContext()
  const { screenScrollHandler } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const selectAddressesKnownFungibleTokens = useMemo(() => makeSelectAddressesKnownFungibleTokens(), [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, address?.hash, true))
  const selectAddressesUnknownTokens = useMemo(() => makeSelectAddressesUnknownTokens(), [])
  const unknownTokens = useAppSelector((s) => selectAddressesUnknownTokens(s, address?.hash))
  const selectAddressesNFTs = useMemo(() => makeSelectAddressesNFTs(), [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, address?.hash))
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [shouldOpenAmountModal, setShouldOpenAmountModal] = useState(!!params?.tokenId)

  const isContinueButtonDisabled = assetAmounts.length < 1

  const handleContinueButtonPress = async () => {
    dispatch(activateAppLoading(t('Building transaction')))
    await buildTransaction({
      onBuildSuccess: () => navigation.navigate('VerifyScreen'),
      onConsolidationSuccess: () => navigation.navigate('ActivityScreen')
    })
    dispatch(deactivateAppLoading())
  }

  const assets = [...knownFungibleTokens, ...nfts, ...unknownTokens]
  const orderedAssets = orderBy(assets, (a) => assetAmounts.find((assetWithAmount) => a.id === assetWithAmount.id))

  const tokenName = params?.tokenId ? orderedAssets.find((t) => t.id === params.tokenId) : undefined

  useEffect(() => {
    const tokenId = params?.tokenId

    if (!tokenId || (tokenId && params.isNft) || !shouldOpenAmountModal) return

    dispatch(
      openModal({
        name: 'TokenAmountModal',
        props: {
          tokenId,
          addressHash: fromAddress,
          onAmountValidate: (amount) => {
            setAssetAmount(tokenId, amount)
            showToast({
              text1: t('Added {{ tokenName }}', { tokenName: tokenName ?? tokenId }),
              type: 'info',
              visibilityTime: ToastDuration.SHORT
            })
          }
        }
      })
    )

    setShouldOpenAmountModal(false)
  }, [dispatch, fromAddress, params?.isNft, params?.tokenId, setAssetAmount, shouldOpenAmountModal, t, tokenName])

  if (!address) return null

  return (
    <FlashListScreen
      data={orderedAssets}
      keyExtractor={({ id }) => id}
      extraData={{ assetAmounts }}
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
  )
}

export default AssetsScreen
