import { ALPH } from '@alephium/token-list'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
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
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'VerifyScreen'>, ScrollScreenProps {}

const VerifyScreen = ({ navigation, ...props }: ScreenProps) => {
  const { fromAddress, toAddress, assetAmounts, fees, sendTransaction } = useSendContext()
  const { screenScrollHandler, screenScrollY } = useHeaderContext()
  const { t } = useTranslation()

  useScrollToTopOnFocus(screenScrollY)

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  if (!fromAddress || !toAddress || assetAmounts.length < 1) return null

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      screenTitle={t('Verify')}
      screenIntro={t('Please, double check that everything is correct before sending.')}
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Send')}
          variant="valid"
          onPress={() => sendTransaction(() => navigation.navigate('ActivityScreen'))}
        />
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
          <Amount value={fees} suffix="ALPH" medium />
        </FeeBox>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerifyScreen

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
