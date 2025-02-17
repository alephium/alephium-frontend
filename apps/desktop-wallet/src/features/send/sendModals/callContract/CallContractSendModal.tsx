import { fromHumanReadableAmount, throttledClient } from '@alephium/shared'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { signAndSendTransaction } from '@/api/transactions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SendModal, { ConfigurableSendModalProps } from '@/features/send/SendModal'
import { CallContractTxData, CallContractTxModalData, TxContext } from '@/features/send/sendTypes'
import { getOptionalTransactionAssetAmounts } from '@/features/send/sendUtils'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'

export type CallContractSendModalProps = ConfigurableSendModalProps<CallContractTxModalData>

const CallContractSendModal = memo((props: ModalBaseProp & CallContractSendModalProps) => {
  const { t } = useTranslation()

  return <SendModal {...props} title={t('Call contract')} type="call-contract" />
})

export default CallContractSendModal

export const buildCallContractTransaction = async (txData: CallContractTxData, ctx: TxContext) => {
  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(txData.assetAmounts)

  const response = await throttledClient.node.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: txData.fromAddress.publicKey,
    bytecode: txData.bytecode,
    attoAlphAmount,
    tokens,
    gasAmount: txData.gasAmount,
    gasPrice: txData.gasPrice ? fromHumanReadableAmount(txData.gasPrice).toString() : undefined
  })
  ctx.setBuildExecuteScriptTxResult(response)
  ctx.setUnsignedTransaction(response)
  ctx.setUnsignedTxId(response.txId)
  ctx.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
}

export const handleCallContractSend = async (
  { fromAddress, assetAmounts }: CallContractTxData,
  ctx: TxContext,
  posthog: PostHog,
  isLedger: boolean,
  onLedgerError: (error: Error) => void
) => {
  if (!ctx.unsignedTransaction) throw Error('No unsignedTransaction available')

  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)
  const data = await signAndSendTransaction(
    fromAddress,
    ctx.unsignedTxId,
    ctx.unsignedTransaction.unsignedTx,
    isLedger,
    onLedgerError
  )

  if (!data) {
    return
  }

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      amount: attoAlphAmount,
      tokens,
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'sent'
    })
  )

  posthog.capture('Called smart contract')

  return data.signature
}

export const getCallContractWalletConnectResult = (
  context: TxContext,
  signature: string
): SignExecuteScriptTxResult => {
  if (!context.buildExecuteScriptTxResult) throw Error('No buildExecuteScriptTxResult available')

  return {
    groupIndex: context.buildExecuteScriptTxResult.fromGroup,
    unsignedTx: context.buildExecuteScriptTxResult.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    gasAmount: context.buildExecuteScriptTxResult.gasAmount,
    gasPrice: BigInt(context.buildExecuteScriptTxResult.gasPrice),
    simulatedOutputs: context.buildExecuteScriptTxResult.simulatedOutputs
  }
}
