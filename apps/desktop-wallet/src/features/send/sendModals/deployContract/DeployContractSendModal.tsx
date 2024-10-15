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

import { throttledClient } from '@alephium/shared'
import { binToHex, contractIdFromAddress, SignDeployContractTxResult } from '@alephium/web3'
import { PostHog } from 'posthog-js'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { signAndSendTransaction } from '@/api/transactions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SendModal, { ConfigurableSendModalProps } from '@/features/send/SendModal'
import { DeployContractTxData, DeployContractTxModalData, TxContext } from '@/features/send/sendTypes'
import { store } from '@/storage/store'
import { transactionSent } from '@/storage/transactions/transactionsActions'

export type DeployContractSendModalProps = ConfigurableSendModalProps<DeployContractTxModalData>

const DeployContractSendModal = memo((props: ModalBaseProp & DeployContractSendModalProps) => {
  const { t } = useTranslation()

  return <SendModal {...props} title={t('Deploy contract')} type="deploy-contract" />
})

export default DeployContractSendModal

export const buildDeployContractTransaction = async (data: DeployContractTxData, context: TxContext) => {
  const initialAttoAlphAmount =
    data.initialAlphAmount !== undefined ? data.initialAlphAmount.amount?.toString() : undefined
  const response = await throttledClient.node.contracts.postContractsUnsignedTxDeployContract({
    fromPublicKey: data.fromAddress.publicKey,
    bytecode: data.bytecode,
    initialAttoAlphAmount,
    issueTokenAmount: data.issueTokenAmount?.toString(),
    gasAmount: data.gasAmount,
    gasPrice: data.gasPrice?.toString()
  })
  context.setContractAddress(response.contractAddress)
  context.setUnsignedTransaction(response)
  context.setUnsignedTxId(response.txId)
  context.setFees(BigInt(response.gasAmount) * BigInt(response.gasPrice))
}

export const getDeployContractWalletConnectResult = (
  context: TxContext,
  signature: string,
  contractAddress: string
): SignDeployContractTxResult => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  return {
    groupIndex: context.unsignedTransaction.fromGroup,
    unsignedTx: context.unsignedTransaction.unsignedTx,
    txId: context.unsignedTxId,
    signature,
    contractAddress,
    contractId: binToHex(contractIdFromAddress(contractAddress)),
    gasAmount: context.unsignedTransaction.gasAmount,
    gasPrice: BigInt(context.unsignedTransaction.gasPrice)
  }
}

export const handleDeployContractSend = async (
  { fromAddress }: DeployContractTxData,
  context: TxContext,
  posthog: PostHog
) => {
  if (!context.unsignedTransaction) throw Error('No unsignedTransaction available')

  const data = await signAndSendTransaction(fromAddress, context.unsignedTxId, context.unsignedTransaction.unsignedTx)

  store.dispatch(
    transactionSent({
      hash: data.txId,
      fromAddress: fromAddress.hash,
      toAddress: '',
      timestamp: new Date().getTime(),
      type: 'contract',
      status: 'sent'
    })
  )

  posthog.capture('Deployed smart contract')

  return data.signature
}