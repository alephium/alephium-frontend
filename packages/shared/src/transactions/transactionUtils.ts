import {
  explorer as e,
  isContractAddress,
  isGrouplessAddress,
  isGrouplessAddressWithGroupIndex,
  node as n
} from '@alephium/web3'

import { AddressHash } from '@/types/addresses'
import { AssetAmount, TokenApiBalances } from '@/types/assets'
import { ExecuteScriptTx, SentTransaction } from '@/types/transactions'
import { uniq } from '@/utils/utils'

export const isConfirmedTx = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | SentTransaction | ExecuteScriptTx
): tx is e.Transaction =>
  // See https://github.com/alephium/alephium-frontend/issues/1367
  'blockHash' in tx && !tx.inputs?.some((input) => input.txHashRef === undefined)

export const isExecuteScriptTx = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | SentTransaction | ExecuteScriptTx
): tx is ExecuteScriptTx => 'simulationResult' in tx

export const isRichTransaction = (
  tx: e.PendingTransaction | n.RichTransaction | e.AcceptedTransaction | e.Transaction
): tx is n.RichTransaction => 'unsigned' in tx

export const isSentTx = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | SentTransaction | ExecuteScriptTx
): tx is SentTransaction => 'status' in tx

export const isWalletSelfTransfer = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  walletAddresses: AddressHash[]
): boolean => getTxAddresses(tx).every((address) => walletAddresses.includes(getBaseAddressStr(address)))

export const isContractTx = (tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction): boolean =>
  !!tx.outputs?.some(inputOutputIsContractAddress) || !!tx.inputs?.some(inputOutputIsContractAddress)

const inputOutputIsContractAddress = (io: e.Input | e.Output): boolean => !!io.address && isContractAddress(io.address)

export const getTxInputsOutputs = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | ExecuteScriptTx
) => {
  const _isExecuteScriptTx = isExecuteScriptTx(tx)

  return {
    inputs: _isExecuteScriptTx ? tx.simulationResult.contractInputs : tx.inputs,
    outputs: _isExecuteScriptTx ? tx.simulationResult.generatedOutputs : tx.outputs
  }
}

export const getTxAddresses = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | ExecuteScriptTx
): AddressHash[] => {
  const addresses = new Set<AddressHash>()
  const { inputs, outputs } = getTxInputsOutputs(tx)

  for (const { address } of [...(outputs ?? []), ...(inputs ?? [])]) {
    if (address) addresses.add(address)
  }

  return Array.from(addresses)
}

export const isGrouplessAddressIntraTransfer = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction
): boolean => {
  const txAddresses = getTxAddresses(tx)
  const firstAddress = txAddresses.at(0)

  if (!firstAddress || !isGrouplessAddress(firstAddress)) return false

  const firstBaseAddress = getBaseAddressStr(firstAddress)

  return txAddresses.every(
    (address) => isGrouplessAddressWithGroupIndex(address) && getBaseAddressStr(address) === firstBaseAddress
  )
}

// Address without group number
export const getBaseAddressStr = (address: string): string => address.split(':')[0]

export const getInputOutputBaseAddress = (io: { address?: string }): string | undefined =>
  io.address ? getBaseAddressStr(io.address) : undefined

export const isSameBaseAddress = (address1: string, address2: string): boolean =>
  getBaseAddressStr(address1) === getBaseAddressStr(address2)

export const isConsolidationTx = (tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return (
    inputAddresses.length === 1 &&
    outputAddresses.length === 1 &&
    inputAddresses[0] !== undefined &&
    outputAddresses[0] !== undefined &&
    isSameBaseAddress(inputAddresses[0], outputAddresses[0])
  )
}

export const findTransactionInternalAddresses = (addresses: AddressHash[], tx: e.Transaction | n.RichTransaction) =>
  addresses.filter((addressHash) => isAddressPresentInInputsOutputs(addressHash, tx))

export const isAddressPresentInInputsOutputs = (
  addressHash: AddressHash,
  tx: e.Transaction | e.PendingTransaction | n.RichTransaction
) => {
  const inputs = isRichTransaction(tx) ? tx.unsigned.inputs : tx.inputs
  const outputs = isRichTransaction(tx) ? tx.unsigned.fixedOutputs : tx.outputs

  return (
    inputs?.some((input) => input.address && isSameBaseAddress(input.address, addressHash)) ||
    outputs?.some((output) => output.address && isSameBaseAddress(output.address, addressHash))
  )
}

export const findTransactionReferenceAddress = (addresses: AddressHash[], tx: e.Transaction | e.PendingTransaction) =>
  addresses.find((address) => isAddressPresentInInputsOutputs(address, tx))

export const shouldBuildSweepTransactions = (assetAmounts: AssetAmount[], tokensBalances: TokenApiBalances[]) =>
  assetAmounts.length === tokensBalances.length &&
  tokensBalances.every(({ id, totalBalance }) => {
    const assetAmount = assetAmounts.find((asset) => asset.id === id)

    return totalBalance === (assetAmount?.amount ?? 0).toString()
  })
