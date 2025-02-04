import { ALPH } from '@alephium/token-list'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import FeeAmounts from '~/features/send/screens/FeeAmounts'
import TotalWorthRow from '~/features/send/screens/TotalWorthRow'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
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

          <TotalWorthRow assetAmounts={assetAmounts} fromAddress={fromAddress} />

          <Row title={t('To')} titleColor="secondary">
            <AddressBadge addressHash={toAddress} />
          </Row>
          <Row title={t('From')} titleColor="secondary">
            <AddressBadge addressHash={fromAddress} />
          </Row>
          <Row title={t('Estimated fees')} titleColor="secondary" isLast>
            <FeeAmounts fees={fees} />
          </Row>
        </Surface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerifyScreen

const AssetAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`
