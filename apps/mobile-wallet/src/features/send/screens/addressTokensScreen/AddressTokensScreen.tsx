import { AddressHash, TokenId } from '@alephium/shared'
import { useFetchAddressFtsSorted, useFetchAddressTokensByType, useSortedTokenIds } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import TokenRow from '~/features/send/screens/addressTokensScreen/TokenRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

interface ScreenProps
  extends StackScreenProps<SendNavigationParamList, 'AddressTokensScreen'>,
    Omit<ScrollScreenProps, 'contentContainerStyle'> {}

const AddressTokensScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, buildTransaction, setAssetAmount } = useSendContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [shouldOpenAmountModal, setShouldOpenAmountModal] = useState(!!params?.tokenId)

  const handleContinueButtonPress = useCallback(async () => {
    dispatch(activateAppLoading(t('Building transaction')))

    await buildTransaction({
      onBuildSuccess: () => navigation.navigate('VerifyScreen'),
      onConsolidationSuccess: () => navigation.navigate('ActivityScreen')
    })
    dispatch(deactivateAppLoading())
  }, [buildTransaction, dispatch, navigation, t])

  useEffect(() => {
    const tokenId = params?.tokenId

    if (!tokenId || (tokenId && params.isNft) || !shouldOpenAmountModal) return

    dispatch(
      openModal({
        name: 'TokenAmountModal',
        props: {
          tokenId,
          addressHash: fromAddress,
          onAmountValidate: (amount, tokenName) => {
            setAssetAmount(tokenId, amount)
            showToast({
              text1: t('Added {{ tokenName }}', { tokenName }),
              type: 'info',
              visibilityTime: ToastDuration.SHORT
            })
          }
        }
      })
    )

    setShouldOpenAmountModal(false)
  }, [dispatch, fromAddress, params?.isNft, params?.tokenId, setAssetAmount, shouldOpenAmountModal, t])

  if (!address) return null

  return (
    <AddressTokensFlashListScreen
      addressHash={address.hash}
      onContinueButtonPress={handleContinueButtonPress}
      {...props}
    />
  )
}

export default AddressTokensScreen

interface AddressTokensFlashListScreenProps extends Partial<FlashListScreenProps<TokenId>> {
  addressHash: AddressHash
  onContinueButtonPress: () => void
}

const AddressTokensFlashListScreen = ({
  addressHash,
  onContinueButtonPress,
  ...props
}: AddressTokensFlashListScreenProps) => {
  const { t } = useTranslation()
  const { screenScrollHandler } = useHeaderContext()
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const {
    data: { nftIds, nstIds }
  } = useFetchAddressTokensByType(addressHash)
  const sortedTokenIds = useSortedTokenIds({ sortedFts, nftIds, nstIds })
  const { assetAmounts } = useSendContext()

  const isContinueButtonDisabled = assetAmounts.length < 1

  return (
    <FlashListScreen
      {...props}
      data={sortedTokenIds}
      extraData={{ assetAmounts }}
      renderItem={({ item: tokenId, index }) => (
        <TokenRow
          key={tokenId}
          tokenId={tokenId}
          isLast={index === sortedTokenIds.length - 1}
          style={{ marginHorizontal: DEFAULT_MARGIN }}
          addressHash={addressHash}
        />
      )}
      contentPaddingTop
      screenTitle={t('Assets')}
      screenIntro={t('With Alephium, you can send multiple assets in one transaction.')}
      estimatedItemSize={64}
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Continue')}
          variant="highlight"
          onPress={onContinueButtonPress}
          disabled={isContinueButtonDisabled}
        />
      )}
    />
  )
}
