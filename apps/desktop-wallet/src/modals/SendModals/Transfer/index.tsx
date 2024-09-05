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

import { client, fromHumanReadableAmount } from '@alephium/shared'
import { SignTransferTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { useTranslation } from 'react-i18next'

import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import SendModal, { ConfigurableSendModalProps } from '@/modals/SendModals/SendModal'
import { TransferTxModalData } from '@/modals/SendModals/sendTypes'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { TransferTxData, TxContext } from '@/types/transactions'
import { getTransactionAssetAmounts } from '@/utils/transactions'

const SendModalTransfer = (props: ConfigurableSendModalProps<TransferTxModalData>) => {
  const { t } = useTranslation()

  return <SendModal {...props} title={t('Send')} type="transfer" />
}

export default SendModalTransfer

export const buildTransferTransaction = async (transactionData: TransferTxData, context: TxContext) => {
  const { fromAddress, toAddress, assetAmounts, gasAmount, gasPrice, lockTime, shouldSweep } = transactionData

  context.setIsSweeping(shouldSweep)

  if (shouldSweep) {
    const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress, toAddress)
    context.setSweepUnsignedTxs(unsignedTxs)
    context.setFees(fees)
  } else {
    const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

    const data = await client.node.transactions.postTransactionsBuild({
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

export const handleTransferSend = async (transactionData: TransferTxData, context: TxContext, posthog: PostHog) => {
  const { fromAddress, toAddress, lockTime: lockDateTime, assetAmounts } = transactionData
  const { isSweeping, sweepUnsignedTxs, consolidationRequired, unsignedTxId, unsignedTransaction } = context

  if (toAddress) {
    const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)
    const lockTime = lockDateTime?.getTime()

    if (isSweeping && sweepUnsignedTxs) {
      const sendToAddress = consolidationRequired ? fromAddress.hash : toAddress
      const type = consolidationRequired ? 'consolidation' : 'sweep'

      for (const { txId, unsignedTx } of sweepUnsignedTxs) {
        const data = await signAndSendTransaction(fromAddress, txId, unsignedTx)

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
            status: 'pending'
          })
        )
      }

      posthog.capture('Swept address assets')
    } else if (unsignedTransaction) {
      const data = await signAndSendTransaction(fromAddress, unsignedTxId, unsignedTransaction.unsignedTx)

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
          status: 'pending'
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
