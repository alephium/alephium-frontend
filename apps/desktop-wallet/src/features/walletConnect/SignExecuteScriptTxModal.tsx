import {
  AssetAmount,
  getHumanReadableError,
  selectAddressByHash,
  SignExecuteScriptTxModalProps,
  throttledClient,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { partition } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLedger } from '@/features/ledger/useLedger'
import { LedgerAlephium } from '@/features/ledger/utils'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import BytecodeExpandableSection from '@/features/send/BytecodeExpandableSection'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { signer } from '@/signer'

const SignExecuteScriptTxModal = ({
  id,
  txParams,
  unsignedData,
  dAppUrl,
  onSuccess,
  onError,
  onUserDismiss
}: SignExecuteScriptTxModalProps & ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const { isLedger, onLedgerError } = useLedger()
  const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
  const posthog = usePostHog()

  const assetAmounts = useMemo(() => calculateAssetAmounts(txParams), [txParams])
  const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

  const onApprovePress = useCallback(async () => {
    try {
      if (!signerAddress) {
        throw Error('Signer address not found')
      }

      let result: SignExecuteScriptTxResult

      if (isLedger) {
        setIsLoading(t('Please, confirm the transaction on your Ledger.'))

        const buildResult = await throttledClient.txBuilder.buildExecuteScriptTx(txParams, signerAddress.publicKey)

        const signature = await LedgerAlephium.create()
          .catch(onLedgerError)
          .then((app) => (app ? app.signUnsignedTx(signerAddress.index, buildResult.unsignedTx) : null))

        if (!signature) {
          throw Error('Ledger error')
        }

        await throttledClient.node.transactions.postTransactionsSubmit({
          unsignedTx: buildResult.unsignedTx,
          signature
        })

        result = { signature, ...buildResult }
      } else {
        setIsLoading(true)

        result = await signer.signAndSubmitExecuteScriptTx(txParams)
      }

      onSuccess(result)

      dispatch(
        transactionSent({
          hash: result.txId,
          fromAddress: txParams.signerAddress,
          toAddress: '',
          amount: txParams.attoAlphAmount?.toString(),
          tokens: txParams.tokens
            ? txParams.tokens.map((token) => ({ id: token.id, amount: token.amount.toString() }))
            : undefined,
          timestamp: new Date().getTime(),
          type: 'contract',
          status: 'sent'
        })
      )

      posthog.capture('Called smart contract')
    } catch (error) {
      onError(getHumanReadableError(error, t('Error while sending the transaction')))
      // TODO: show toast
      // TODO: analytics
    } finally {
      dispatch(closeModal({ id }))
      setIsLoading(false)
    }
  }, [dispatch, id, isLedger, onError, onLedgerError, onSuccess, posthog, signerAddress, t, txParams])

  const handleRejectPress = () => {
    onUserDismiss?.()
    dispatch(closeModal({ id }))
  }

  return (
    <CenteredModal
      id={id}
      title={t('Call contract')}
      onClose={handleRejectPress}
      isLoading={isLoading}
      focusMode
      disableBack
      hasFooterButtons
    >
      <CheckModalContent>
        {assetAmounts && <CheckAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding />}
        <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
        {assetAmounts && <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />}
        <BytecodeExpandableSection bytecode={txParams.bytecode} />
      </CheckModalContent>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={handleRejectPress}>
          {t('Reject')}
        </ModalFooterButton>
        <ModalFooterButton onClick={onApprovePress} variant="valid">
          {t('Approve')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default SignExecuteScriptTxModal

const calculateAssetAmounts = ({ tokens, attoAlphAmount }: SignExecuteScriptTxModalProps['txParams']) => {
  let assetAmounts: AssetAmount[] = []
  let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

  if (tokens) {
    const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
    const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)

    assetAmounts = tokenAssets
    allAlphAssets = [...allAlphAssets, ...alphAssets]
  }

  if (allAlphAssets.length > 0) {
    assetAmounts.push({
      id: ALPH.id,
      amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
    })
  }

  return assetAmounts
}
