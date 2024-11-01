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

import { ALPH } from '@alephium/token-list'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import { BackButton, ContinueButton } from '~/components/buttons/Button'
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
  const { setHeaderOptions, screenScrollHandler, screenScrollY } = useHeaderContext()
  const { t } = useTranslation()

  useScrollToTopOnFocus(screenScrollY)

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        headerRight: () => (
          <ContinueButton
            onPress={() => sendTransaction(() => navigation.navigate('ActivityScreen'))}
            iconProps={{ name: 'send' }}
            title={t('Send')}
          />
        )
      })
    }, [navigation, sendTransaction, setHeaderOptions, t])
  )

  if (!fromAddress || !toAddress || assetAmounts.length < 1) return null

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      screenTitle={t('Verify')}
      screenIntro={t('Please, double check that everything is correct before sending.')}
      onScroll={screenScrollHandler}
      {...props}
    >
      <ScreenSection>
        <Surface>
          <Row title={t('Sending')} titleColor="secondary">
            <AssetAmounts>
              {assets.map(({ id, amount }) =>
                amount ? (
                  <AssetAmountWithLogo key={id} assetId={id} logoSize={18} amount={BigInt(amount)} fullPrecision />
                ) : null
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
