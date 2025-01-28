import { calculateAmountWorth, selectAllPrices, selectPriceById } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { StackScreenProps } from '@react-navigation/stack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'VerifyScreen'>, ScrollScreenProps {}

const VerifyScreen = ({ navigation, ...props }: ScreenProps) => {
  const { fromAddress, toAddress, assetAmounts, fees, sendTransaction } = useSendContext()
  const { screenScrollHandler, screenScrollY, parentNavigation } = useHeaderContext()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  useScrollToTopOnFocus(screenScrollY)

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  if (!fromAddress || !toAddress || assetAmounts.length < 1) return null

  const onSendSuccess = () => {
    showToast({ type: 'success', text1: t('Transaction sent') })
    parentNavigation?.navigate('ActivityScreen')
  }

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop={insets.top + VERTICAL_GAP * 2} // TODO: avoid manual override (see TODO in DestinationScreen)
      screenTitle={t('Verify')}
      screenIntro={t('Please, double check that everything is correct before sending.')}
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button title={t('Send')} variant="valid" onPress={() => sendTransaction(onSendSuccess)} />
      )}
      {...props}
    >
      <ScreenSection>
        <Surface>
          <Row title={t('Sending')} titleColor="secondary">
            <AssetAmounts>
              {assets.map(({ id, amount }) =>
                amount ? <AssetAmountWithLogo key={id} assetId={id} amount={BigInt(amount)} fullPrecision /> : null
              )}
            </AssetAmounts>
          </Row>

          <TotalWorthRow />

          <Row title={t('To')} titleColor="secondary">
            <AddressBadge addressHash={toAddress} />
          </Row>
          <Row title={t('From')} titleColor="secondary" isLast>
            <AddressBadge addressHash={fromAddress} />
          </Row>
        </Surface>
      </ScreenSection>
      <ScreenSection>
        <FeeBox>
          <AppText color="secondary" semiBold>
            {t('Estimated fees')}
          </AppText>
          <FeeAmounts>
            <Amount value={fees} suffix="ALPH" medium />
            <FeeWorth />
          </FeeAmounts>
        </FeeBox>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerifyScreen

// This component will be improved by reusing the worth in desktop wallet after migrating to Tanstack
const TotalWorthRow = () => {
  const tokenPrices = useAppSelector(selectAllPrices)
  const { fromAddress, assetAmounts } = useSendContext()
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, fromAddress))
  const { t } = useTranslation()

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  const totalWorth = assets.reduce((totalWorth, token) => {
    const tokenInfo = knownFungibleTokens.find(({ id }) => id === token.id)
    const tokenPrice = tokenPrices.find(({ symbol }) => symbol === tokenInfo?.symbol)?.price

    return totalWorth + calculateAmountWorth(BigInt(token.amount), tokenPrice ?? 0, tokenInfo?.decimals ?? 0)
  }, 0)

  if (!totalWorth) return null

  return (
    <Row title={t('Total worth')} titleColor="secondary">
      <Amount value={totalWorth} isFiat bold />
    </Row>
  )
}

const FeeWorth = () => {
  const { fees } = useSendContext()
  const alphPrice = useAppSelector((s) => selectPriceById(s, ALPH.symbol)?.price)
  const { t } = useTranslation()

  const feesWorth = calculateAmountWorth(fees, alphPrice ?? 0, ALPH.decimals)
  const isTooSmall = feesWorth < 0.01
  const displayedFeesWorth = isTooSmall ? 0.01 : feesWorth

  return (
    <Amount value={displayedFeesWorth} isFiat fiatPrefix={isTooSmall ? t('less than') : undefined} color="secondary" />
  )
}

const AssetAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`

const FeeBox = styled.View`
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 9px;
  padding: 12px 10px;
  flex-direction: row;
  justify-content: space-between;
`

const FeeAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`
