import {
  getHumanReadableError,
  selectAddressByHash,
  SessionRequestEvent,
  throttledClient,
  transactionSent,
  WALLETCONNECT_ERRORS,
  WalletConnectError
} from '@alephium/shared'
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
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { getSdkError } from '@walletconnect/utils'
import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import useWalletConnectToasts from '~/contexts/walletConnect/useWalletConnectToasts'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import withModal from '~/features/modals/withModal'
import FeeAmounts from '~/features/send/screens/FeeAmounts'
import TotalWorthRow from '~/features/send/screens/TotalWorthRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { SessionRequestData } from '~/types/walletConnect'
import { showExceptionToast, showToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface WalletConnectSessionRequestModalProps<T extends SessionRequestData> {
  requestData: T
  requestEvent: SessionRequestEvent
}

const WalletConnectSessionRequestModal = withModal(
  <T extends SessionRequestData>({
    id,
    requestData,
    requestEvent
  }: WalletConnectSessionRequestModalProps<T> & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { respondToWalletConnect, respondToWalletConnectWithError, activeSessions } = useWalletConnectContext()
    const signAddress = useAppSelector((s) => selectAddressByHash(s, requestData.wcData.fromAddress))
    const { t } = useTranslation()
    const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
    const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
    const { showApprovedToast, showRejectedToast } = useWalletConnectToasts()
    const { dismiss } = useBottomSheetModal()

    const [isApproving, setIsApproving] = useState(false)

    const metadata = activeSessions.find((s) => s.topic === requestEvent.topic)?.peer.metadata
    const isSignRequest = requestData.type === 'sign-message' || requestData.type === 'sign-unsigned-tx'
    const fees = !isSignRequest
      ? BigInt(requestData.unsignedTxData.gasAmount) * BigInt(requestData.unsignedTxData.gasPrice)
      : undefined

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
                status: 'sent',
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
                status: 'sent',
                type: 'contract',
                toAddress: ''
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
                status: 'sent',
                type: 'contract',
                toAddress: ''
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

          if (requestData.submit) {
            await throttledClient.node.transactions.postTransactionsSubmit({
              unsignedTx: requestData.wcData.unsignedTx,
              signature
            })
          }

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
        dismiss(id)
      }
    }

    const onSignSuccess = async (result: SignMessageResult | SignUnsignedTxResult) => {
      if (!requestEvent) return

      console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')
      await respondToWalletConnect(requestEvent, { id: requestEvent.id, jsonrpc: '2.0', result })
      console.log('✅ INFORMING: DONE!')

      console.log('👉 RESETTING SESSION REQUEST EVENT.')
      showApprovedToast()
    }

    const onReject = async () => {
      try {
        console.log('⏳ INFORMING DAPP THAT SESSION REQUEST FAILED...')
        await respondToWalletConnectWithError(requestEvent, getSdkError('USER_REJECTED'))
        console.log('✅ INFORMING: DONE!')
      } catch (e) {
        console.error('❌ INFORMING: FAILED.')
      } finally {
        showRejectedToast()
        dismiss(id)
      }
    }

    const onSendTxOrSignFail = async (error: WalletConnectError) => {
      try {
        console.log('⏳ INFORMING DAPP THAT SESSION REQUEST FAILED...')
        await respondToWalletConnectWithError(requestEvent, error)
        console.log('✅ INFORMING: DONE!')
      } catch (e) {
        console.error('❌ INFORMING: FAILED.')
      } finally {
        dismiss(id)
      }
    }

    const onApprove = async (
      sendTransaction: () => Promise<
        SignExecuteScriptTxResult | SignDeployContractTxResult | SignTransferTxResult | undefined
      >
    ) =>
      triggerBiometricsAuthGuard({
        settingsToCheck: 'transactions',
        successCallback: () =>
          triggerFundPasswordAuthGuard({
            successCallback: async () => {
              dispatch(activateAppLoading(t('Approving')))

              setIsApproving(true)

              try {
                const signResult = await sendTransaction()

                if (!signResult) {
                  console.log('⏳ DID NOT GET A SIGNATURE RESULT, INFORMING DAPP THAT SESSION REQUEST FAILED...')
                  await respondToWalletConnectWithError(requestEvent, {
                    message: 'Sending transaction failed',
                    code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
                  })
                  console.log('✅ INFORMING: DONE!')
                } else {
                  console.log('⏳ INFORMING DAPP THAT SESSION REQUEST SUCCEEDED...')
                  await respondToWalletConnect(requestEvent, {
                    id: requestEvent.id,
                    jsonrpc: '2.0',
                    result: signResult
                  })
                  console.log('✅ INFORMING: DONE!')
                }
              } catch (e) {
                console.error('❌ INFORMING: FAILED.')
              } finally {
                console.log('👉 RESETTING SESSION REQUEST EVENT.')
                dispatch(deactivateAppLoading())
                showApprovedToast()
                dismiss(id)
              }
            }
          })
      })

    return (
      <BottomModal2 modalId={id} onClose={!isApproving ? onReject : undefined} contentVerticalGap>
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
                <>
                  <Row title={t('Sending')} titleColor="secondary">
                    <AssetAmounts>
                      {requestData.wcData.assetAmounts.map(({ id, amount }) =>
                        amount ? <AssetAmountWithLogo key={id} assetId={id} amount={BigInt(amount)} /> : null
                      )}
                    </AssetAmounts>
                  </Row>

                  <TotalWorthRow assetAmounts={requestData.wcData.assetAmounts} />
                </>
              )}
            <Row title={isSignRequest ? t('Signing with') : t('From')} titleColor="secondary">
              <AddressBadge addressHash={requestData.wcData.fromAddress} />
            </Row>

            {requestData.type === 'deploy-contract' || requestData.type === 'call-contract' ? (
              metadata?.url && (
                <Row title={t('To')} titleColor="secondary" noMaxWidth>
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
              <CopyBytecodeRow bytecode={requestData.wcData.bytecode} />
            )}
            {requestData.type === 'sign-unsigned-tx' && (
              <>
                <Row isVertical title={t('Unsigned TX ID')} titleColor="secondary">
                  <AppText>{requestData.unsignedTxData.unsignedTx.txId}</AppText>
                </Row>
                <Row isVertical title={t('Unsigned TX')} titleColor="secondary">
                  <AppText>{requestData.wcData.unsignedTx}</AppText>
                </Row>
              </>
            )}
            {requestData.type === 'sign-message' && (
              <Row isVertical title={t('Message')} titleColor="secondary">
                <AppText>{requestData.wcData.message}</AppText>
              </Row>
            )}
            {fees !== undefined && (
              <Row title={t('Estimated fees')} titleColor="secondary" isLast>
                <FeeAmounts fees={fees} />
              </Row>
            )}
          </Surface>
        </ScreenSection>
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
      </BottomModal2>
    )
  }
)

export default WalletConnectSessionRequestModal

const CopyBytecodeRow = ({ bytecode }: { bytecode: string }) => {
  const { t } = useTranslation()

  const handleCopy = () => {
    Clipboard.setStringAsync(bytecode)
    showToast({ text1: t('Bytecode copied') })
  }

  return (
    <Row title={t('Bytecode')} titleColor="secondary">
      <Button iconProps={{ name: 'copy-outline' }} onPress={handleCopy} />
    </Row>
  )
}

const AssetAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
