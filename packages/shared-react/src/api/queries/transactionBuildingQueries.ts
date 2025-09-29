import { throttledClient } from '@alephium/shared'
import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignTransferTxParams } from '@alephium/web3'
import { queryOptions } from '@tanstack/react-query'

interface BuildTxQueryBaseProps {
  publicKey: string
  networkId?: number
}

export const buildTransferTxQuery = ({
  params,
  publicKey
}: BuildTxQueryBaseProps & {
  params: SignTransferTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'transfer', params],
    queryFn: () => throttledClient.txBuilder.buildTransferTx(params, publicKey)
  })

export const buildExecuteScriptTxQuery = ({
  params,
  publicKey
}: BuildTxQueryBaseProps & {
  params: SignExecuteScriptTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'executeScript', params],
    queryFn: () => throttledClient.txBuilder.buildExecuteScriptTx(params, publicKey)
  })

export const buildDeployContractTxQuery = ({
  params,
  publicKey
}: BuildTxQueryBaseProps & {
  params: SignDeployContractTxParams
}) =>
  queryOptions({
    queryKey: ['buildTx', 'deployContract', params],
    queryFn: () => throttledClient.txBuilder.buildDeployContractTx(params, publicKey)
  })

export const decodeUnsignedTxQuery = ({ unsignedTx }: { unsignedTx: string }) =>
  queryOptions({
    queryKey: ['decodeUnsignedTx', unsignedTx],
    queryFn: () => throttledClient.node.transactions.postTransactionsDecodeUnsignedTx({ unsignedTx })
  })
