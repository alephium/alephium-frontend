import { throttledClient } from '@alephium/shared/api'
import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignTransferTxParams } from '@alephium/web3'
import { queryOptions } from '@tanstack/react-query'

interface BuildTxQueryBaseProps {
  publicKey: string
  networkId: number
}

export const buildTransferTxQuery = ({
  params,
  publicKey,
  networkId
}: BuildTxQueryBaseProps & {
  params: SignTransferTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'transfer', params, publicKey, { networkId }],
    queryFn: () => throttledClient.txBuilder.buildTransferTx(params, publicKey)
  })

export const buildExecuteScriptTxQuery = ({
  params,
  publicKey,
  networkId
}: BuildTxQueryBaseProps & {
  params: SignExecuteScriptTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'executeScript', params, publicKey, { networkId }],
    queryFn: () => throttledClient.txBuilder.buildExecuteScriptTx(params, publicKey)
  })

export const buildDeployContractTxQuery = ({
  params,
  publicKey,
  networkId
}: BuildTxQueryBaseProps & {
  params: SignDeployContractTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'deployContract', params, publicKey, { networkId }],
    queryFn: () => throttledClient.txBuilder.buildDeployContractTx(params, publicKey)
  })

export const decodeUnsignedTxQuery = ({ unsignedTx }: { unsignedTx: string }) =>
  queryOptions({
    queryKey: ['decodeUnsignedTx', unsignedTx],
    queryFn: () => throttledClient.node.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx })
  })
