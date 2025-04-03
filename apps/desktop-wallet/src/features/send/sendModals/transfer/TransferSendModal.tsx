import { fromHumanReadableAmount, throttledClient } from '@alephium/shared'
import { SignTransferTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SendModal, { ConfigurableSendModalProps } from '@/features/send/SendModal'
import { TransferTxData, TransferTxModalData, TxContext } from '@/features/send/sendTypes'
import { getTransactionAssetAmounts } from '@/features/send/sendUtils'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'

export type TransferSendModalProps = ConfigurableSendModalProps<TransferTxModalData>

const TransferSendModal = memo((props: ModalBaseProp & TransferSendModalProps) => {
  const { t } = useTranslation()

  return <SendModal {...props} title={t('Send')} type="transfer" />
})

export default TransferSendModal

export const buildTransferTransaction = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, assetAmounts, gasAmount, gasPrice, lockTime, shouldSweep } = transactionData

  context.setIsSweeping(shouldSweep)

  if (shouldSweep) {
    const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress.publicKey, toAddress)
    context.setSweepUnsignedTxs(unsignedTxs)
    context.setFees(fees)
  } else {
    const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

    const data = await throttledClient.node.transactions.postTransactionsBuild({
      fromPublicKey: fromAddress.publicKey,
      destinations: [
        {
          address: toAddress,
          attoAlphAmount,
          tokens,
          lockTime: lockTime ? lockTime.getTime() : undefined
        }
      ],
      gasAmount: gasAmount ? gasAmount : undefined,
      gasPrice: gasPrice ? fromHumanReadableAmount(gasPrice).toString() : undefined
    })
    context.setUnsignedTransaction(data)
    context.setUnsignedTxId(data.txId)
    context.setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
  }
}

export const handleTransferSend = async (
  transactionData: TransferTxData,
  context: TxContext,
  posthog: PostHog,
  isLedger: boolean,
  onLedgerError: (error: Error) => void,
  consolidationRequired: boolean
) => {
  const { fromAddress, toAddress, lockTime: lockDateTime, assetAmounts } = transactionData
  const { isSweeping, sweepUnsignedTxs, unsignedTxId, unsignedTransaction } = context

  if (toAddress) {
    const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
    const lockTime = lockDateTime?.getTime()

    if (isSweeping && sweepUnsignedTxs) {
      const sendToAddress = consolidationRequired ? fromAddress.hash : toAddress
      const type = consolidationRequired ? 'consolidation' : 'sweep'

      for (const { txId, unsignedTx } of sweepUnsignedTxs) {
        const data = await signAndSendTransaction(fromAddress, txId, unsignedTx, isLedger, onLedgerError)

        if (!data) {
          return
        }

        store.dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: fromAddress.hash,
            toAddress: sendToAddress,
            amount: attoAlphAmount,
            tokens,
            timestamp: new Date().getTime(),
            lockTime,
            type,
            status: 'sent'
          })
        )
      }

      posthog.capture('Swept address assets', { from: 'button' })
    } else if (unsignedTransaction) {
      const data = await signAndSendTransaction(
        fromAddress,
        unsignedTxId,
        unsignedTransaction.unsignedTx,
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
          toAddress,
          amount: attoAlphAmount,
          tokens,
          timestamp: new Date().getTime(),
          lockTime,
          type: 'transfer',
          status: 'sent'
        })
      )

      posthog.capture('Sent transaction', { number_of_tokens: tokens.length, locked: !!lockTime })

      return data.txId
    }
  }
}

export const getTransferWalletConnectResult = (context: TxContext, signature: string): SignTransferTxResult => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  return {
    fromGroup: context.unsignedTransaction.fromGroup,
    toGroup: context.unsignedTransaction.toGroup,
    unsignedTx: context.unsignedTransaction.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    gasAmount: context.unsignedTransaction.gasAmount,
    gasPrice: BigInt(context.unsignedTransaction.gasPrice)
  }
}
