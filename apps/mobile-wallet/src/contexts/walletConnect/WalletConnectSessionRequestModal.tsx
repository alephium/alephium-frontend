import {
  getHumanReadableError,
  selectAddressByHash,
  SessionRequestEvent,
  throttledClient,
  WALLETCONNECT_ERRORS,
  WalletConnectError
} from '@alephium/shared'
import { hashMessage, sign, SignMessageResult, SignUnsignedTxResult, transactionSign } from '@alephium/web3'
import { getSdkError } from '@walletconnect/utils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import useWalletConnectToasts from '~/contexts/walletConnect/useWalletConnectToasts'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { SessionRequestData } from '~/types/walletConnect'
import { showExceptionToast } from '~/utils/layout'

interface WalletConnectSessionRequestModalProps<T extends SessionRequestData> {
  requestData: T
  requestEvent: SessionRequestEvent
}

const WalletConnectSessionRequestModal = memo(
  <T extends SessionRequestData>({
    id,
    requestData,
    requestEvent
  }: WalletConnectSessionRequestModalProps<T> & ModalBaseProp) => {
    const { respondToWalletConnect, respondToWalletConnectWithError, activeSessions } = useWalletConnectContext()
    const signAddress = useAppSelector((s) => selectAddressByHash(s, requestData.wcData.fromAddress))
    const { t } = useTranslation()
    const { showApprovedToast, showRejectedToast } = useWalletConnectToasts()
    const { dismissModal, onDismiss } = useModalDismiss({ id })

    const metadata = activeSessions.find((s) => s.topic === requestEvent.topic)?.peer.metadata

    const handleSignPress = async () => {
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
        dismissModal()
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
        dismissModal()
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
        dismissModal()
      }
    }

    return (
      <BottomModal2 onDismiss={onDismiss} modalId={id} onClose={onReject} contentVerticalGap>
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
            <Row title={t('Signing with')} titleColor="secondary">
              <AddressBadge addressHash={requestData.wcData.fromAddress} />
            </Row>

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
          </Surface>
        </ScreenSection>
        <ScreenSection centered>
          <ButtonsRow>
            <Button title={t('Reject')} variant="alert" onPress={onReject} flex />
            <Button title={t('Sign')} variant="valid" onPress={handleSignPress} flex />
          </ButtonsRow>
        </ScreenSection>
      </BottomModal2>
    )
  }
)

export default WalletConnectSessionRequestModal

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
