import { getHumanReadableError, transactionSent } from '@alephium/shared'
import { node as n, SignExecuteScriptTxResult } from '@alephium/web3'
import * as Clipboard from 'expo-clipboard'
import { memo } from 'react'
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
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import FeeAmounts from '~/features/send/screens/FeeAmounts'
import TotalWorthRow from '~/features/send/screens/TotalWorthRow'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { SignExecuteScriptTxParamsWithAmounts } from '~/types/transactions'
import { showExceptionToast, showToast } from '~/utils/layout'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface SignExecuteScriptTxModalProps {
  txParams: SignExecuteScriptTxParamsWithAmounts
  unsignedData: n.BuildExecuteScriptTxResult
  onError: (message: string) => void
  onSuccess: (signResult: SignExecuteScriptTxResult) => void
  onReject: () => void
  dAppUrl?: string
  dAppIcon?: string
}

const SignExecuteScriptTxModal = memo(
  ({
    id,
    txParams,
    unsignedData,
    dAppUrl,
    dAppIcon,
    onError,
    onReject,
    onSuccess
  }: SignExecuteScriptTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
    const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
    const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss: onReject })

    const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

    const handleApprovePress = () => {
      triggerBiometricsAuthGuard({
        settingsToCheck: 'transactions',
        successCallback: () =>
          triggerFundPasswordAuthGuard({
            successCallback: sendTransaction
          })
      })
    }

    const sendTransaction = async () => {
      dispatch(activateAppLoading(t('Approving')))

      try {
        const data = await signAndSendTransaction(txParams.signerAddress, unsignedData.txId, unsignedData.unsignedTx)
        const { attoAlphAmount, tokens } = getTransactionAssetAmounts(txParams.assetAmounts)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            amount: attoAlphAmount,
            tokens,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'contract',
            toAddress: ''
          })
        )

        // TODO: Update event name
        sendAnalytics({ event: 'WC: Approved contract call' })

        onSuccess({
          groupIndex: unsignedData.fromGroup,
          unsignedTx: unsignedData.unsignedTx,
          txId: unsignedData.txId,
          signature: data.signature,
          gasAmount: unsignedData.gasAmount,
          gasPrice: BigInt(unsignedData.gasPrice),
          simulatedOutputs: []
        })
      } catch (error) {
        const message = 'Could not send transaction'
        const translatedMessage = t(message)

        onError(getHumanReadableError(error, translatedMessage))

        showExceptionToast(error, translatedMessage)
        sendAnalytics({ type: 'error', message })
      } finally {
        dispatch(deactivateAppLoading())
        dismissModal()
      }
    }

    const handleRejectPress = () => {
      onReject()
      dismissModal()
    }

    return (
      <BottomModal2 onDismiss={onDismiss} modalId={id} contentVerticalGap>
        <ScreenSection>
          <Surface>
            {txParams.assetAmounts.length > 0 && (
              <>
                <Row title={t('Sending')} titleColor="secondary">
                  <AssetAmounts>
                    {txParams.assetAmounts.map(({ id, amount }) =>
                      amount ? <AssetAmountWithLogo key={id} assetId={id} amount={BigInt(amount)} /> : null
                    )}
                  </AssetAmounts>
                </Row>

                <TotalWorthRow assetAmounts={txParams.assetAmounts} />
              </>
            )}
            <Row title={t('From')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            {dAppUrl && (
              <Row title={t('To')} titleColor="secondary" noMaxWidth>
                {dAppIcon && <DAppIcon source={{ uri: dAppIcon }} />}
                <AppText semiBold>{dAppUrl}</AppText>
              </Row>
            )}

            <CopyBytecodeRow bytecode={txParams.bytecode} />

            {fees !== undefined && (
              <Row title={t('Estimated fees')} titleColor="secondary" isLast>
                <FeeAmounts fees={fees} />
              </Row>
            )}
          </Surface>
        </ScreenSection>
        <ScreenSection centered>
          <ButtonsRow>
            <Button title={t('Reject')} variant="alert" onPress={handleRejectPress} flex />
            <Button title={t('Approve')} variant="valid" onPress={handleApprovePress} flex />
          </ButtonsRow>
        </ScreenSection>
      </BottomModal2>
    )
  }
)

export default SignExecuteScriptTxModal

const CopyBytecodeRow = ({ bytecode }: { bytecode: string }) => {
  const { t } = useTranslation()

  const handleCopy = () => {
    Clipboard.setStringAsync(bytecode)
    showToast({ text1: t('Bytecode copied') })
  }

  return (
    <Row title={t('Bytecode')} titleColor="secondary">
      <Button iconProps={{ name: 'copy' }} onPress={handleCopy} />
    </Row>
  )
}

const AssetAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`

const DAppIcon = styled(Image)`
  width: 20px;
  height: 20px;
`
