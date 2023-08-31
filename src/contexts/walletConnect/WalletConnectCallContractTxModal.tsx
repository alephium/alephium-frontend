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

import { getHumanReadableError } from '@alephium/sdk'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { BuildExecuteScriptTxResult } from '@alephium/web3/dist/src/api/api-alephium'
import { SessionTypes } from '@walletconnect/types'
import { usePostHog } from 'posthog-react-native'
import { Image } from 'react-native'
import Toast from 'react-native-root-toast'
import styled from 'styled-components/native'

import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import HighlightRow from '~/components/HighlightRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalProps } from '~/components/layout/Modals'
import { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppDispatch } from '~/hooks/redux'
import { transactionSent } from '~/store/addressesSlice'
import { CallContractTxData } from '~/types/transactions'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface WalletConnectCallContractTxModalProps extends ModalProps<ScrollScreenProps> {
  wcTxData: CallContractTxData
  unsignedTxData: BuildExecuteScriptTxResult
  onApprove: (sendTransaction: () => Promise<SignExecuteScriptTxResult | undefined>) => Promise<void>
  onReject: () => Promise<void>
  metadata?: SessionTypes.Struct['peer']['metadata']
}

const WalletConnectCallContractTxModal = ({
  wcTxData,
  unsignedTxData,
  onApprove,
  onReject,
  metadata,
  ...props
}: WalletConnectCallContractTxModalProps) => {
  const posthog = usePostHog()
  const dispatch = useAppDispatch()

  const fees = BigInt(unsignedTxData.gasAmount) * BigInt(unsignedTxData.gasPrice)

  const handleApprovePress = () => onApprove(sendTransaction)

  const sendTransaction = async () => {
    try {
      const data = await signAndSendTransaction(wcTxData.fromAddress, unsignedTxData.txId, unsignedTxData.unsignedTx)

      const { attoAlphAmount, tokens } = wcTxData.assetAmounts
        ? getTransactionAssetAmounts(wcTxData.assetAmounts)
        : { attoAlphAmount: undefined, tokens: undefined }

      dispatch(
        transactionSent({
          hash: data.txId,
          fromAddress: wcTxData.fromAddress.hash,
          amount: attoAlphAmount,
          tokens,
          timestamp: new Date().getTime(),
          status: 'pending',
          type: 'call-contract'
        })
      )

      posthog?.capture('WC: Approved contract call')

      return {
        groupIndex: unsignedTxData.fromGroup,
        unsignedTx: unsignedTxData.unsignedTx,
        txId: unsignedTxData.txId,
        signature: data.signature,
        gasAmount: unsignedTxData.gasAmount,
        gasPrice: BigInt(unsignedTxData.gasPrice)
      } as SignExecuteScriptTxResult
    } catch (e) {
      console.error('Could not send transaction', e)
      Toast.show(getHumanReadableError(e, 'Could not send transaction'))
      posthog?.capture('Error', { message: 'Could not send transaction' })
    }
  }

  return (
    <ScrollScreen {...props}>
      {metadata && (
        <ScreenSection>
          {metadata.icons && metadata.icons.length > 0 && metadata.icons[0] && (
            <DAppIcon source={{ uri: metadata.icons[0] }} />
          )}
          <BottomModalScreenTitle>Smart contract request</BottomModalScreenTitle>
          {metadata.url && (
            <AppText color="tertiary" size={13}>
              from {metadata.url}
            </AppText>
          )}
        </ScreenSection>
      )}
      <ScreenSection>
        <BoxSurface>
          {wcTxData.assetAmounts && wcTxData.assetAmounts.length > 0 && (
            <HighlightRow title="Sending" titleColor="secondary">
              <AssetAmounts>
                {wcTxData.assetAmounts.map(({ id, amount }) =>
                  amount ? <AssetAmountWithLogo key={id} assetId={id} logoSize={18} amount={BigInt(amount)} /> : null
                )}
              </AssetAmounts>
            </HighlightRow>
          )}
          {/* {initialAlphAmount?.amount !== undefined && (
          <HighlightRow title="Sending" titleColor="secondary">
            <AssetAmountWithLogo assetId={ALPH.id} logoSize={18} amount={BigInt(initialAlphAmount.amount)} />
          </HighlightRow>
        )} */}
          {/* {toAddress && (
          <HighlightRow title="To" titleColor="secondary">
            <AddressBadge addressHash={toAddress} />
          </HighlightRow>
        )} */}
          <HighlightRow title="From" titleColor="secondary">
            <AddressBadge addressHash={wcTxData.fromAddress.hash} />
          </HighlightRow>
          {metadata?.name && (
            <HighlightRow title="To" titleColor="secondary">
              <AppText semiBold>{metadata.name}</AppText>
            </HighlightRow>
          )}

          <HighlightRow title="Bytecode" titleColor="secondary">
            <AppText>{wcTxData.bytecode}</AppText>
          </HighlightRow>

          {/* {issueTokenAmount && (
          <HighlightRow title="Issue token amount" titleColor="secondary">
            <AppText>{issueTokenAmount}</AppText>
          </HighlightRow>
        )} */}
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
      <BottomScreenSection>
        <ButtonsRow>
          <Button title="Reject" variant="alert" onPress={onReject} />
          <Button title="Approve" variant="valid" onPress={handleApprovePress} />
        </ButtonsRow>
      </BottomScreenSection>
    </ScrollScreen>
  )
}

export default WalletConnectCallContractTxModal

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

// TODO: DRY
const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
