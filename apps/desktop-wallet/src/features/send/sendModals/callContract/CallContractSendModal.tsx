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
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  return {
    groupIndex: context.unsignedTransaction.fromGroup,
    unsignedTx: context.unsignedTransaction.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    gasAmount: context.unsignedTransaction.gasAmount,
    gasPrice: BigInt(context.unsignedTransaction.gasPrice)
  }
}
