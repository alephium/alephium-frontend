import { formatAmountForDisplay, MAXIMAL_GAS_FEE } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { SignChainedTxModalContent } from '~/features/ecosystem/modals/SignChainedTxModal'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import { SignTransferTxModalAddressesRows } from '~/features/ecosystem/modals/SignTransferTxModal'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'VerifyScreen'>, ScrollScreenProps {}

const VerifyScreen = ({ navigation, ...props }: ScreenProps) => {
  const { fromAddress, toAddress, assetAmounts, fees, sendTransaction, chainedTxProps } = useSendContext()
  const { screenScrollHandler, parentNavigation } = useHeaderContext()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  if (!fromAddress || !toAddress || assetAmounts.length < 1) return null

  const onSendSuccess = () => {
    showToast({ type: 'success', text1: t('Transaction sent') })
    parentNavigation?.navigate('InWalletTabsNavigation', {
      screen: 'ActivityScreen'
    })
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
        {chainedTxProps ? (
          <>
            <Surface type="accent" style={{ padding: 20 }}>
              <AppText color="accent" style={{ textAlign: 'center' }}>
                {t(
                  "The origin address doesn't have enough ALPH for gas fees. But don't you worry, {{ amount }} ALPH will be automatically transferred from another address in your wallet!",
                  {
                    amount: formatAmountForDisplay({
                      amount: MAXIMAL_GAS_FEE,
                      amountDecimals: ALPH.decimals,
                      displayDecimals: 2
                    })
                  }
                )}
              </AppText>
            </Surface>
            <SignChainedTxModalContent props={chainedTxProps} />
          </>
        ) : (
          <Surface>
            <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />
            <SignTransferTxModalAddressesRows fromAddress={fromAddress} toAddress={toAddress} />
            <SignModalFeesRow fees={fees} />
          </Surface>
        )}
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerifyScreen
