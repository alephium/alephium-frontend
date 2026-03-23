import { AddressHash, selectAddressByHash, shouldBuildSweepTransactions, TokenId } from '@alephium/shared'
import {
  useFetchAddressBalances,
  useFetchAddressFtsSorted,
  useFetchAddressTokensByType,
  useSortedTokenIds
} from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import FlashListScreen, { FlashListScreenProps } from '~/components/layout/FlashListScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { BuildTransactionCallbacks, useSendContext } from '~/contexts/SendContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { openModal } from '~/features/modals/modalActions'
import TokenRow from '~/features/send/screens/addressTokensScreen/TokenRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

interface ScreenProps
  extends StackScreenProps<SendNavigationParamList, 'AddressTokensScreen'>,
    Omit<ScrollScreenProps, 'contentContainerStyle'> {}

const AddressTokensScreen = ({
  navigation,
  route: { params },
  maintainVisibleContentPosition,
  ...props
}: ScreenProps) => {
  const { fromAddress, setAssetAmount } = useSendContext()
  const { parentNavigation } = useHeaderContext()
  const address = useAppSelector((s) => selectAddressByHash(s, fromAddress ?? ''))
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [shouldOpenAmountModal, setShouldOpenAmountModal] = useState(!!params?.tokenId)

  useEffect(() => {
    const tokenId = params?.tokenId

    if (!tokenId || (tokenId && params.isNft) || !shouldOpenAmountModal || !fromAddress) return

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

  const onBuildSuccess = useCallback(() => navigation.navigate('VerifyScreen'), [navigation])

  const onConsolidationSuccess = useCallback(
    () => parentNavigation?.navigate('InWalletTabsNavigation', { screen: 'ActivityScreen' }),
    [parentNavigation]
  )

  if (!address) return null

  return (
    <AddressTokensFlashListScreen
      addressHash={address.hash}
      onBuildSuccess={onBuildSuccess}
      onConsolidationSuccess={onConsolidationSuccess}
      {...props}
    />
  )
}

export default AddressTokensScreen

interface AddressTokensFlashListScreenProps extends Partial<FlashListScreenProps<TokenId>>, BuildTransactionCallbacks {
  addressHash: AddressHash
}

const AddressTokensFlashListScreen = ({
  addressHash,
  onBuildSuccess,
  onConsolidationSuccess,
  ...props
}: AddressTokensFlashListScreenProps) => {
  const { t } = useTranslation()
  const { screenScrollHandler } = useHeaderContext()
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const {
    data: { nftIds, nstIds }
  } = useFetchAddressTokensByType(addressHash)
  const sortedTokenIds = useSortedTokenIds({ sortedFts, nftIds, nstIds })
  const { assetAmounts, buildTransaction } = useSendContext()
  const dispatch = useAppDispatch()
  const { data: tokensBalances } = useFetchAddressBalances(addressHash)

  const isContinueButtonDisabled = assetAmounts.length < 1
  const shouldSweep = shouldBuildSweepTransactions(assetAmounts, tokensBalances ?? [])

  const handleContinueButtonPress = useCallback(async () => {
    dispatch(activateAppLoading(t('Building transaction')))

    await buildTransaction({ onBuildSuccess, onConsolidationSuccess }, shouldSweep)

    dispatch(deactivateAppLoading())
  }, [buildTransaction, dispatch, onBuildSuccess, onConsolidationSuccess, shouldSweep, t])

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
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Continue')}
          variant="highlight"
          onPress={handleContinueButtonPress}
          disabled={isContinueButtonDisabled}
        />
      )}
    />
  )
}
