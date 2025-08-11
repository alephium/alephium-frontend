import { explorer as e } from '@alephium/web3'

import {
  addressHasOnlyNegativeAmountDeltas,
  addressHasOnlyPositiveAmountDeltas,
  getInputOutputBaseAddresses,
  isAirdrop,
  isAlphAmountReduced,
  isBidirectionalTransfer
} from '@/transactions/transactionAmounts'
import {
  getBaseAddressStr,
  getTxAddresses,
  isConfirmedTx,
  isContractTx,
  isGrouplessAddressIntraTransfer,
  isWalletSelfTransfer
} from '@/transactions/transactionUtils'
import { AddressHash } from '@/types/addresses'
import { SentTransaction } from '@/types/transactions'
import { uniq } from '@/utils/utils'

export type TransactionInfoType2 =
  | 'pending'
  | 'wallet-self-transfer' // all input/outputs are addresses of the same wallet
  | 'address-self-transfer' // all input/outputs are the same address
  | 'address-group-transfer' // all input/outputs are multiple subaddresses of the same groupless address
  | 'dApp' // at least one input/output is a contract address
  | 'dApp-failed'
  | 'bidirectional-transfer' // the reference address has both positive and negative amount deltas
  | 'outgoing'
  | 'airdrop'
  | 'incoming'

export const getTransactionInfoType = ({
  tx,
  referenceAddress,
  internalAddresses
}: {
  tx: e.Transaction | e.PendingTransaction | SentTransaction
  referenceAddress: string
  internalAddresses: string[]
}): TransactionInfoType2 => {
  if (!isConfirmedTx(tx)) {
    return 'pending'
  } else if (!tx.scriptExecutionOk) {
    return 'dApp-failed'
  } else if (isSelfTransfer(tx)) {
    return 'address-self-transfer'
  } else if (isGrouplessAddressIntraTransfer(tx)) {
    return 'address-group-transfer'
  } else if (isWalletSelfTransfer(tx, internalAddresses)) {
    return 'wallet-self-transfer'
  } else if (isBidirectionalTransfer(tx, referenceAddress)) {
    return 'bidirectional-transfer'
  } else if (isContractTx(tx)) {
    return 'dApp'
  } else if (isAlphAmountReduced(tx, referenceAddress)) {
    return 'outgoing'
  } else if (isAirdrop(tx, referenceAddress)) {
    return 'airdrop'
  } else {
    return 'incoming'
  }
}

interface GetTxAddressesProps {
  tx: e.Transaction | e.PendingTransaction
  referenceAddress: string
}

// TODO: Write tests
export const getTransactionOriginAddresses = ({ tx, referenceAddress }: GetTxAddressesProps): AddressHash[] => {
  if (!tx.inputs || tx.inputs.length === 0) return []

  const infoType = getTransactionInfoType({ tx, referenceAddress, internalAddresses: [] })

  switch (infoType) {
    case 'incoming':
      return getInputAddressesWithOnlyNegativeAmountDeltas(tx)
    case 'outgoing':
      return getInputAddressesWithOnlyNegativeAmountDeltas(tx)
    case 'pending':
      return getInputAddressesWithOnlyNegativeAmountDeltas(tx)
    case 'dApp':
      return [referenceAddress]
    case 'airdrop':
      return getInputAddressesWithOnlyNegativeAmountDeltas(tx)
    case 'dApp-failed':
      return [referenceAddress]
    case 'bidirectional-transfer':
      return [referenceAddress]
    case 'wallet-self-transfer':
      return getInputAddressesWithOnlyNegativeAmountDeltas(tx)
    case 'address-self-transfer':
      return [referenceAddress]
    case 'address-group-transfer':
      return [referenceAddress]
  }
}

// TODO: Write tests
export const getTransactionDestinationAddresses = ({ tx, referenceAddress }: GetTxAddressesProps): AddressHash[] => {
  if (!tx.outputs || tx.outputs.length === 0) return []

  const infoType = getTransactionInfoType({ tx, referenceAddress, internalAddresses: [] })

  switch (infoType) {
    case 'incoming':
      return [referenceAddress]
    case 'outgoing':
      return getOutputAddressesWithOnlyPositiveAmountDeltas(tx)
    case 'pending':
      return getOutputAddressesWithOnlyPositiveAmountDeltas(tx)
    case 'dApp':
      return getDappOperationAddresses(tx, referenceAddress)
    case 'airdrop':
      return [referenceAddress]
    case 'dApp-failed':
      return getDappOperationAddresses(tx, referenceAddress)
    case 'bidirectional-transfer':
      return getDappOperationAddresses(tx, referenceAddress)
    case 'wallet-self-transfer':
      return getOutputAddressesWithOnlyPositiveAmountDeltas(tx)
    case 'address-self-transfer':
      return [referenceAddress]
    case 'address-group-transfer':
      return [referenceAddress]
  }
}

const getInputAddressesWithOnlyNegativeAmountDeltas = (tx: e.Transaction | e.PendingTransaction) =>
  getInputOutputBaseAddresses(tx.inputs ?? []).filter((address) => addressHasOnlyNegativeAmountDeltas(tx, address))

const getDappOperationAddresses = (tx: e.Transaction | e.PendingTransaction, referenceAddress: string) =>
  uniq(getTxAddresses(tx).map(getBaseAddressStr)).filter((address) => address !== referenceAddress)

const getOutputAddressesWithOnlyPositiveAmountDeltas = (tx: e.Transaction | e.PendingTransaction) =>
  getInputOutputBaseAddresses(tx.outputs ?? []).filter((address) => addressHasOnlyPositiveAmountDeltas(tx, address))

const isSelfTransfer = (tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return (
    inputAddresses.length === 1 &&
    outputAddresses.length === 1 &&
    inputAddresses[0] !== undefined &&
    outputAddresses[0] !== undefined &&
    inputAddresses[0] === outputAddresses[0]
  )
}
