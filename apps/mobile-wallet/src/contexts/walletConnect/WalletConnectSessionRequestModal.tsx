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

import { getHumanReadableError, SessionRequestEvent, WALLETCONNECT_ERRORS, WalletConnectError } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import {
  binToHex,
  contractIdFromAddress,
  hashMessage,
  sign,
  SignDeployContractTxResult,
  SignExecuteScriptTxResult,
  SignMessageResult,
  SignTransferTxResult,
  SignUnsignedTxResult,
  transactionSign
} from '@alephium/web3'
import { SessionTypes } from '@walletconnect/types'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import ExpandableRow from '~/components/ExpandableRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { selectAddressByHash } from '~/store/addressesSlice'
import { transactionSent } from '~/store/transactions/transactionsActions'
import { SessionRequestData } from '~/types/walletConnect'
import { showExceptionToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface WalletConnectSessionRequestModalProps<T extends SessionRequestData> {
  requestData: T
  onApprove: (
    sendTransaction: () => Promise<
      SignTransferTxResult | SignExecuteScriptTxResult | SignDeployContractTxResult | undefined
    >
  ) => Promise<void>
  onReject: () => Promise<void>
  onSendTxOrSignFail: (error: WalletConnectError) => Promise<void>
  onSignSuccess: (result: SignMessageResult) => Promise<void>
  metadata?: SessionTypes.Struct['peer']['metadata']
  sessionRequestEvent?: SessionRequestEvent
}

const WalletConnectSessionRequestModal = withModal(
  <T extends SessionRequestData>({
    id,
    requestData,
    onApprove,
    onReject,
    onSendTxOrSignFail,
    onSignSuccess,
    metadata,
    sessionRequestEvent
  }: WalletConnectSessionRequestModalProps<T> & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { walletConnectClient } = useWalletConnectContext()
    const signAddress = useAppSelector((s) => selectAddressByHash(s, requestData.wcData.fromAddress))
    const { t } = useTranslation()

    const isSignRequest = requestData.type === 'sign-message' || requestData.type === 'sign-unsigned-tx'
    const fees = !isSignRequest
      ? BigInt(requestData.unsignedTxData.gasAmount) * BigInt(requestData.unsignedTxData.gasPrice)
      : undefined

    const handleManualClose = () => {
      console.log('👉 CLOSING MODAL.')

      if (sessionRequestEvent && walletConnectClient && walletConnectClient?.getPendingSessionRequests().length > 0) {
        console.log('👉 USER CLOSED THE MODAL WITHOUT REJECTING/APPROVING SO WE NEED TO REJECT.')
        onReject()
      }
    }

    // Close modal if the session request event becomes undefined
    useEffect(() => {
      if (sessionRequestEvent === undefined) dispatch(closeModal({ id }))
    }, [dispatch, id, sessionRequestEvent])

    const handleApprovePress = () => onApprove(sendTransaction)

    const sendTransaction = async () => {
      if (isSignRequest) return

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

            sendAnalytics({ event: 'WC: Approved transfer' })

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

            sendAnalytics({ event: 'WC: Approved contract call' })

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

            sendAnalytics({ event: 'WC: Approved contract deployment' })

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
      } catch (error) {
        const message = 'Could not send transaction'
        const translatedMessage = t(message)

        showExceptionToast(error, translatedMessage)
        sendAnalytics({ type: 'error', message })
        onSendTxOrSignFail({
          message: getHumanReadableError(error, translatedMessage),
          code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
        })
      }
    }

    const handleSignPress = async () => {
      if (!isSignRequest) return

      if (!signAddress) {
        onSendTxOrSignFail({
          message: "Signer address doesn't exist",
          code: WALLETCONNECT_ERRORS.SIGNER_ADDRESS_DOESNT_EXIST
        })
        return
      }

      let signResult: SignUnsignedTxResult | SignMessageResult

      try {
        if (requestData.type === 'sign-message') {
          const messageHash = hashMessage(requestData.wcData.message, requestData.wcData.messageHasher)
          signResult = { signature: sign(messageHash, await getAddressAsymetricKey(signAddress.hash, 'private')) }
        } else {
          const signature = transactionSign(
            requestData.unsignedTxData.unsignedTx.txId,
            await getAddressAsymetricKey(signAddress.hash, 'private')
          )

          signResult = {
            ...requestData.unsignedTxData,
            signature,
            txId: requestData.unsignedTxData.unsignedTx.txId,
            gasAmount: requestData.unsignedTxData.unsignedTx.gasAmount,
            gasPrice: BigInt(requestData.unsignedTxData.unsignedTx.gasPrice),
            unsignedTx: requestData.wcData.unsignedTx
          }
        }

        await onSignSuccess(signResult)
      } catch (error) {
        const message =
          requestData.type === 'sign-message' ? 'Could not sign message' : 'Could not sign unsigned transaction'
        const translatedMessage = t(message)

        showExceptionToast(error, translatedMessage)
        sendAnalytics({ type: 'error', message })
        onSendTxOrSignFail({
          message: getHumanReadableError(error, translatedMessage),
          code:
            requestData.type === 'sign-message'
              ? WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
              : WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
        })
      } finally {
        dispatch(closeModal({ id }))
      }
    }

    return (
      <BottomModal modalId={id} onClose={handleManualClose}>
        <ModalContent verticalGap>
          {metadata && (
            <ScreenSection>
              {metadata.icons && metadata.icons.length > 0 && metadata.icons[0] && (
                <DAppIcon source={{ uri: metadata.icons[0] }} />
              )}
              <ModalScreenTitle>
                {
                  {
                    transfer: t('Transfer request'),
                    'call-contract': t('Smart contract request'),
                    'deploy-contract': t('Smart contract request'),
                    'sign-message': t('Sign message'),
                    'sign-unsigned-tx': t('Sign unsigned transaction')
                  }[requestData.type]
                }
              </ModalScreenTitle>
              {metadata.url && (
                <AppText color="tertiary" size={13}>
                  {t('from {{ url }}', { url: metadata.url })}
                </AppText>
              )}
            </ScreenSection>
          )}
          <ScreenSection>
            <Surface>
              {(requestData.type === 'transfer' || requestData.type === 'call-contract') &&
                requestData.wcData.assetAmounts &&
                requestData.wcData.assetAmounts.length > 0 && (
                  <Row title={t('Sending')} titleColor="secondary">
                    <AssetAmounts>
                      {requestData.wcData.assetAmounts.map(({ id, amount }) =>
                        amount ? <AssetAmountWithLogo key={id} assetId={id} amount={BigInt(amount)} /> : null
                      )}
                    </AssetAmounts>
                  </Row>
                )}
              <Row title={isSignRequest ? t('Signing with') : t('From')} titleColor="secondary">
                <AddressBadge addressHash={requestData.wcData.fromAddress} />
              </Row>

              {requestData.type === 'deploy-contract' || requestData.type === 'call-contract' ? (
                metadata?.url && (
                  <Row title={t('To')} titleColor="secondary">
                    <AppText semiBold>{metadata.url}</AppText>
                  </Row>
                )
              ) : requestData.type === 'transfer' ? (
                <Row title={t('To')} titleColor="secondary">
                  <AddressBadge addressHash={requestData.wcData.toAddress} />
                </Row>
              ) : null}

              {requestData.type === 'deploy-contract' && (
                <>
                  {!!requestData.wcData.initialAlphAmount?.amount && (
                    <Row title={t('Initial amount')} titleColor="secondary">
                      <AssetAmountWithLogo
                        assetId={ALPH.id}
                        amount={BigInt(requestData.wcData.initialAlphAmount.amount)}
                        fullPrecision
                      />
                    </Row>
                  )}
                  {requestData.wcData.issueTokenAmount && (
                    <Row title={t('Issue token amount')} titleColor="secondary">
                      <AppText>{requestData.wcData.issueTokenAmount}</AppText>
                    </Row>
                  )}
                </>
              )}

              {(requestData.type === 'deploy-contract' || requestData.type === 'call-contract') && (
                <ExpandableRow
                  titleComponent={
                    <AppTextStyled medium color="secondary">
                      {t('Bytecode')}
                    </AppTextStyled>
                  }
                >
                  <Row isVertical>
                    <AppText>{requestData.wcData.bytecode}</AppText>
                  </Row>
                </ExpandableRow>
              )}
              {requestData.type === 'sign-unsigned-tx' && (
                <>
                  <Row isVertical title={t('Unsigned TX ID')} titleColor="secondary">
                    <AppText>{requestData.unsignedTxData.unsignedTx.txId}</AppText>
                  </Row>
                  <Row isVertical isLast title={t('Unsigned TX')} titleColor="secondary">
                    <AppText>{requestData.wcData.unsignedTx}</AppText>
                  </Row>
                </>
              )}
              {requestData.type === 'sign-message' && (
                <Row isVertical isLast title={t('Message')} titleColor="secondary">
                  <AppText>{requestData.wcData.message}</AppText>
                </Row>
              )}
            </Surface>
          </ScreenSection>
          {fees !== undefined && (
            <ScreenSection>
              <FeeBox>
                <AppText color="secondary" semiBold>
                  {t('Estimated fees')}
                </AppText>
                <Amount value={fees} suffix="ALPH" medium />
              </FeeBox>
            </ScreenSection>
          )}
          <ScreenSection centered>
            <ButtonsRow>
              <Button title={t('Reject')} variant="alert" onPress={onReject} flex />
              {isSignRequest ? (
                <Button title={t('Sign')} variant="valid" onPress={handleSignPress} flex />
              ) : (
                <Button title={t('Approve')} variant="valid" onPress={handleApprovePress} flex />
              )}
            </ButtonsRow>
          </ScreenSection>
        </ModalContent>
      </BottomModal>
    )
  }
)

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

const AppTextStyled = styled(AppText)`
  padding-left: 14px;
`
