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

import { ALPH } from '@alephium/token-list'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import HighlightRow from '~/components/HighlightRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { BackButton, ContinueButton } from '~/screens/SendReceive/ScreenHeader'
import ScreenIntro from '~/screens/SendReceive/ScreenIntro'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'VerifyScreen'>, ScrollScreenProps {}

const VerifyScreen = ({ navigation, ...props }: ScreenProps) => {
  const { fromAddress, toAddress, assetAmounts, fees, sendTransaction } = useSendContext()

  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
  const assets = [{ id: ALPH.id, amount: attoAlphAmount }, ...tokens]

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => (
        <ContinueButton text="Send" onPress={() => sendTransaction(() => navigation.navigate('TransfersScreen'))} />
      )
    })
  })

  if (!fromAddress || !toAddress || assetAmounts.length < 1) return null

  return (
    <ScrollScreen {...props}>
      <ScreenIntro
        title="Verify"
        subtitle="Please, double check that everything is correct before sending."
        surtitle="SEND"
      />
      <ScreenSection>
        <BoxSurface>
          <HighlightRow title="Sending" titleColor="secondary">
            <AssetAmounts>
              {assets.map(({ id, amount }) =>
                amount ? <AssetAmountWithLogo key={id} assetId={id} logoSize={18} amount={BigInt(amount)} /> : null
              )}
            </AssetAmounts>
          </HighlightRow>
          <HighlightRow title="To" titleColor="secondary">
            <AddressBadge addressHash={toAddress} />
          </HighlightRow>
          <HighlightRow title="From" titleColor="secondary">
            <AddressBadge addressHash={fromAddress} />
          </HighlightRow>
        </BoxSurface>
      </ScreenSection>
      <ScreenSection>
        <FeeBox>
          <AppText color="secondary" semiBold>
            Estimated fees
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
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 9px;
  padding: 12px 10px;
  flex-direction: row;
  justify-content: space-between;
`
