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
import { ALPH } from '@alephium/token-list'
import {
  binToHex,
  contractIdFromAddress,
  SignDeployContractTxResult,
  SignExecuteScriptTxResult,
  SignTransferTxResult
} from '@alephium/web3'
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
import { TxData } from '~/types/walletConnect'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface WalletConnectTxModalProps<T extends TxData> extends ModalProps<ScrollScreenProps> {
  txData: T
  onApprove: (
    sendTransaction: () => Promise<
      SignTransferTxResult | SignExecuteScriptTxResult | SignDeployContractTxResult | undefined
    >
  ) => Promise<void>
  onReject: () => Promise<void>
  metadata?: SessionTypes.Struct['peer']['metadata']
}

const WalletConnectTxModal = <T extends TxData>({
  txData,
  onApprove,
  onReject,
  metadata,
  ...props
}: WalletConnectTxModalProps<T>) => {
  const posthog = usePostHog()
  const dispatch = useAppDispatch()

  const fees = BigInt(txData.unsignedTxData.gasAmount) * BigInt(txData.unsignedTxData.gasPrice)

  const handleApprovePress = () => onApprove(sendTransaction)

  const sendTransaction = async () => {
    try {
      const data = await signAndSendTransaction(
        txData.wcData.fromAddress,
        txData.unsignedTxData.txId,
        txData.unsignedTxData.unsignedTx
      )

      switch (txData.type) {
        case 'transfer': {
          const { attoAlphAmount, tokens } = getTransactionAssetAmounts(txData.wcData.assetAmounts)

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: txData.wcData.fromAddress.hash,
              toAddress: txData.wcData.toAddress,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'transfer'
            })
          )

          posthog?.capture('WC: Approved transfer')

          return {
            fromGroup: txData.unsignedTxData.fromGroup,
            toGroup: txData.unsignedTxData.toGroup,
            unsignedTx: txData.unsignedTxData.unsignedTx,
            txId: txData.unsignedTxData.txId,
            signature: data.signature,
            gasAmount: txData.unsignedTxData.gasAmount,
            gasPrice: BigInt(txData.unsignedTxData.gasPrice)
          } as SignTransferTxResult
        }
        case 'call-contract': {
          const { attoAlphAmount, tokens } = txData.wcData.assetAmounts
            ? getTransactionAssetAmounts(txData.wcData.assetAmounts)
            : { attoAlphAmount: undefined, tokens: undefined }

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: txData.wcData.fromAddress.hash,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'call-contract'
            })
          )

          posthog?.capture('WC: Approved contract call')

          return {
            groupIndex: txData.unsignedTxData.fromGroup,
            unsignedTx: txData.unsignedTxData.unsignedTx,
            txId: txData.unsignedTxData.txId,
            signature: data.signature,
            gasAmount: txData.unsignedTxData.gasAmount,
            gasPrice: BigInt(txData.unsignedTxData.gasPrice)
          } as SignExecuteScriptTxResult
        }
        case 'deploy-contract': {
          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: txData.wcData.fromAddress.hash,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'deploy-contract'
            })
          )

          posthog?.capture('WC: Approved contract deployment')

          return {
            groupIndex: txData.unsignedTxData.fromGroup,
            unsignedTx: txData.unsignedTxData.unsignedTx,
            txId: txData.unsignedTxData.txId,
            signature: data.signature,
            contractAddress: txData.unsignedTxData.contractAddress,
            contractId: binToHex(contractIdFromAddress(txData.unsignedTxData.contractAddress)),
            gasAmount: txData.unsignedTxData.gasAmount,
            gasPrice: BigInt(txData.unsignedTxData.gasPrice)
          } as SignDeployContractTxResult
        }
      }
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
          <BottomModalScreenTitle>
            {
              {
                transfer: 'Transfer request',
                'call-contract': 'Smart contract request',
                'deploy-contract': 'Smart contract request'
              }[txData.type]
            }
          </BottomModalScreenTitle>
          {metadata.url && (
            <AppText color="tertiary" size={13}>
              from {metadata.url}
            </AppText>
          )}
        </ScreenSection>
      )}
      <ScreenSection>
        <BoxSurface>
          {(txData.type === 'transfer' || txData.type === 'call-contract') &&
            txData.wcData.assetAmounts &&
            txData.wcData.assetAmounts.length > 0 && (
              <HighlightRow title="Sending" titleColor="secondary">
                <AssetAmounts>
                  {txData.wcData.assetAmounts.map(({ id, amount }) =>
                    amount ? <AssetAmountWithLogo key={id} assetId={id} logoSize={18} amount={BigInt(amount)} /> : null
                  )}
                </AssetAmounts>
              </HighlightRow>
            )}
          <HighlightRow title="From" titleColor="secondary">
            <AddressBadge addressHash={txData.wcData.fromAddress.hash} />
          </HighlightRow>

          {txData.type === 'deploy-contract' || txData.type === 'call-contract' ? (
            metadata?.name && (
              <HighlightRow title="To" titleColor="secondary">
                <AppText semiBold>{metadata.name}</AppText>
              </HighlightRow>
            )
          ) : (
            <HighlightRow title="To" titleColor="secondary">
              <AddressBadge addressHash={txData.wcData.toAddress} />
            </HighlightRow>
          )}

          {txData.type === 'deploy-contract' && (
            <>
              {!!txData.wcData.initialAlphAmount?.amount && (
                <HighlightRow title="Initial amount" titleColor="secondary">
                  <AssetAmountWithLogo
                    assetId={ALPH.id}
                    logoSize={18}
                    amount={BigInt(txData.wcData.initialAlphAmount.amount)}
                  />
                </HighlightRow>
              )}
              {txData.wcData.issueTokenAmount && (
                <HighlightRow title="Issue token amount" titleColor="secondary">
                  <AppText>{txData.wcData.issueTokenAmount}</AppText>
                </HighlightRow>
              )}
            </>
          )}

          {(txData.type === 'deploy-contract' || txData.type === 'call-contract') && (
            <HighlightRow title="Bytecode" titleColor="secondary">
              <AppText>{txData.wcData.bytecode}</AppText>
            </HighlightRow>
          )}
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

export default WalletConnectTxModal

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

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
