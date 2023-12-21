/*
Copyright 2018 - 2023 The Alephium Authors
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
import styled from 'styled-components/native'

import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useAppDispatch } from '~/hooks/redux'
import { transactionSent } from '~/store/addressesSlice'
import { SessionRequestData } from '~/types/walletConnect'
import { showExceptionToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface WalletConnectSessionRequestModalProps<T extends SessionRequestData> extends ModalContentProps {
  requestData: T
  onApprove: (
    sendTransaction: () => Promise<
      SignTransferTxResult | SignExecuteScriptTxResult | SignDeployContractTxResult | undefined
    >
  ) => Promise<void>
  onReject: () => Promise<void>
  metadata?: SessionTypes.Struct['peer']['metadata']
}

const WalletConnectSessionRequestModal = <T extends SessionRequestData>({
  requestData,
  onApprove,
  onReject,
  metadata,
  ...props
}: WalletConnectSessionRequestModalProps<T>) => {
  const posthog = usePostHog()
  const dispatch = useAppDispatch()

  const fees = BigInt(requestData.unsignedTxData.gasAmount) * BigInt(requestData.unsignedTxData.gasPrice)

  const handleApprovePress = () => onApprove(sendTransaction)

  const sendTransaction = async () => {
    try {
      const data = await signAndSendTransaction(
        requestData.wcData.fromAddress,
        requestData.unsignedTxData.txId,
        requestData.unsignedTxData.unsignedTx
      )

      switch (requestData.type) {
        case 'transfer': {
          const { attoAlphAmount, tokens } = getTransactionAssetAmounts(requestData.wcData.assetAmounts)

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: requestData.wcData.fromAddress,
              toAddress: requestData.wcData.toAddress,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'transfer'
            })
          )

          posthog?.capture('WC: Approved transfer')

          return {
            fromGroup: requestData.unsignedTxData.fromGroup,
            toGroup: requestData.unsignedTxData.toGroup,
            unsignedTx: requestData.unsignedTxData.unsignedTx,
            txId: requestData.unsignedTxData.txId,
            signature: data.signature,
            gasAmount: requestData.unsignedTxData.gasAmount,
            gasPrice: BigInt(requestData.unsignedTxData.gasPrice)
          } as SignTransferTxResult
        }
        case 'call-contract': {
          const { attoAlphAmount, tokens } = requestData.wcData.assetAmounts
            ? getTransactionAssetAmounts(requestData.wcData.assetAmounts)
            : { attoAlphAmount: undefined, tokens: undefined }

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: requestData.wcData.fromAddress,
              amount: attoAlphAmount,
              tokens,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'call-contract'
            })
          )

          posthog?.capture('WC: Approved contract call')

          return {
            groupIndex: requestData.unsignedTxData.fromGroup,
            unsignedTx: requestData.unsignedTxData.unsignedTx,
            txId: requestData.unsignedTxData.txId,
            signature: data.signature,
            gasAmount: requestData.unsignedTxData.gasAmount,
            gasPrice: BigInt(requestData.unsignedTxData.gasPrice)
          } as SignExecuteScriptTxResult
        }
        case 'deploy-contract': {
          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: requestData.wcData.fromAddress,
              timestamp: new Date().getTime(),
              status: 'pending',
              type: 'deploy-contract'
            })
          )

          posthog?.capture('WC: Approved contract deployment')

          return {
            groupIndex: requestData.unsignedTxData.fromGroup,
            unsignedTx: requestData.unsignedTxData.unsignedTx,
            txId: requestData.unsignedTxData.txId,
            signature: data.signature,
            contractAddress: requestData.unsignedTxData.contractAddress,
            contractId: binToHex(contractIdFromAddress(requestData.unsignedTxData.contractAddress)),
            gasAmount: requestData.unsignedTxData.gasAmount,
            gasPrice: BigInt(requestData.unsignedTxData.gasPrice)
          } as SignDeployContractTxResult
        }
      }
    } catch (e) {
      console.error('Could not send transaction', e)
      showExceptionToast(e, 'Could not send transaction')
      posthog?.capture('Error', { message: 'Could not send transaction' })
    }
  }

  return (
    <ModalContent verticalGap {...props}>
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
              }[requestData.type]
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
          {(requestData.type === 'transfer' || requestData.type === 'call-contract') &&
            requestData.wcData.assetAmounts &&
            requestData.wcData.assetAmounts.length > 0 && (
              <Row title="Sending" titleColor="secondary">
                <AssetAmounts>
                  {requestData.wcData.assetAmounts.map(({ id, amount }) =>
                    amount ? <AssetAmountWithLogo key={id} assetId={id} logoSize={18} amount={BigInt(amount)} /> : null
                  )}
                </AssetAmounts>
              </Row>
            )}
          <Row title="From" titleColor="secondary">
            <AddressBadge addressHash={requestData.wcData.fromAddress} />
          </Row>

          {requestData.type === 'deploy-contract' || requestData.type === 'call-contract' ? (
            metadata?.url && (
              <Row title="To" titleColor="secondary">
                <AppText semiBold>{metadata.url}</AppText>
              </Row>
            )
          ) : (
            <Row title="To" titleColor="secondary">
              <AddressBadge addressHash={requestData.wcData.toAddress} />
            </Row>
          )}

          {requestData.type === 'deploy-contract' && (
            <>
              {!!requestData.wcData.initialAlphAmount?.amount && (
                <Row title="Initial amount" titleColor="secondary">
                  <AssetAmountWithLogo
                    assetId={ALPH.id}
                    logoSize={18}
                    amount={BigInt(requestData.wcData.initialAlphAmount.amount)}
                    fullPrecision
                  />
                </Row>
              )}
              {requestData.wcData.issueTokenAmount && (
                <Row title="Issue token amount" titleColor="secondary">
                  <AppText>{requestData.wcData.issueTokenAmount}</AppText>
                </Row>
              )}
            </>
          )}

          {(requestData.type === 'deploy-contract' || requestData.type === 'call-contract') && (
            <Row title="Bytecode" titleColor="secondary">
              <AppText>{requestData.wcData.bytecode}</AppText>
            </Row>
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
      <ScreenSection centered>
        <ButtonsRow>
          <Button title="Reject" variant="alert" onPress={onReject} flex />
          <Button title="Approve" variant="valid" onPress={handleApprovePress} flex />
        </ButtonsRow>
      </ScreenSection>
    </ModalContent>
  )
}

export default WalletConnectSessionRequestModal

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
