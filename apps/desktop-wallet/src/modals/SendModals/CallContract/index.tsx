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
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { signAndSendTransaction } from '@/api/transactions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SendModal, { ConfigurableSendModalProps } from '@/modals/SendModals/SendModal'
import { CallContractTxModalData } from '@/modals/SendModals/sendTypes'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import { CallContractTxData, TxContext } from '@/types/transactions'
import { getOptionalTransactionAssetAmounts } from '@/utils/transactions'

export type SendModalCallContractProps = ConfigurableSendModalProps<CallContractTxModalData>

const SendModalCallContract = memo((props: ModalBaseProp & SendModalCallContractProps) => {
  const { t } = useTranslation()

  return <SendModal {...props} title={t('Call contract')} type="call-contract" />
})

export default SendModalCallContract

export const buildCallContractTransaction = async (txData: CallContractTxData, ctx: TxContext) => {
  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(txData.assetAmounts)

  const response = await client.node.contracts.postContractsUnsignedTxExecuteScript({
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
  posthog: PostHog
) => {
  if (!ctx.unsignedTransaction) throw Error('No unsignedTransaction available')

  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)
  const data = await signAndSendTransaction(fromAddress, ctx.unsignedTxId, ctx.unsignedTransaction.unsignedTx)

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      amount: attoAlphAmount,
      tokens,
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'pending'
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
