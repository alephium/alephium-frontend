import { explorer as e } from '@alephium/web3'

import {
  addressHasOnlyNegativeAmountDeltas,
  addressHasOnlyPositiveAmountDeltas,
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isAlphAmountReduced,
  isBidirectionalTransfer
} from '@/transactions/transactionAmounts'
import {
  getBaseAddressStr,
  getInputOutputBaseAddress,
  getTxAddresses,
  isConfirmedTx,
  isConsolidationTx,
  isContractTx,
  isGrouplessAddressIntraTransfer,
  isWalletSelfTransfer
} from '@/transactions/transactionUtils'
import { AddressHash } from '@/types/addresses'
import { SentTransaction, TransactionInfoType } from '@/types/transactions'
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
  | 'incoming'

export const getTransactionInfoType2 = ({
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

  const infoType = getTransactionInfoType2({ tx, referenceAddress, internalAddresses: [] })

  return {
    incoming: getInputAddressesWithOnlyNegativeAmountDeltas(tx),
    outgoing: getInputAddressesWithOnlyNegativeAmountDeltas(tx),
    pending: getInputAddressesWithOnlyNegativeAmountDeltas(tx),
    dApp: [referenceAddress],
    'dApp-failed': [referenceAddress],
    'bidirectional-transfer': [referenceAddress],
    'wallet-self-transfer': getInputAddressesWithOnlyNegativeAmountDeltas(tx),
    'address-self-transfer': [referenceAddress],
    'address-group-transfer': [referenceAddress]
  }[infoType]
}

// TODO: Write tests
export const getTransactionDestinationAddresses = ({ tx, referenceAddress }: GetTxAddressesProps): AddressHash[] => {
  if (!tx.outputs || tx.outputs.length === 0) return []

  const infoType = getTransactionInfoType2({ tx, referenceAddress, internalAddresses: [] })

  return {
    incoming: [referenceAddress],
    outgoing: getOutputAddressesWithOnlyPositiveAmountDeltas(tx),
    pending: getOutputAddressesWithOnlyPositiveAmountDeltas(tx),
    dApp: getDappOperationAddresses(tx, referenceAddress),
    'dApp-failed': getDappOperationAddresses(tx, referenceAddress),
    'bidirectional-transfer': getDappOperationAddresses(tx, referenceAddress),
    'wallet-self-transfer': getOutputAddressesWithOnlyPositiveAmountDeltas(tx),
    'address-self-transfer': [referenceAddress],
    'address-group-transfer': [referenceAddress]
  }[infoType]
}

const getInputAddressesWithOnlyNegativeAmountDeltas = (tx: e.Transaction | e.PendingTransaction) =>
  getInputOutputBaseAddresses(tx.inputs ?? []).filter((address) => addressHasOnlyNegativeAmountDeltas(tx, address))

const getDappOperationAddresses = (tx: e.Transaction | e.PendingTransaction, referenceAddress: string) =>
  uniq(getTxAddresses(tx).map(getBaseAddressStr)).filter((address) => address !== referenceAddress)

const getOutputAddressesWithOnlyPositiveAmountDeltas = (tx: e.Transaction | e.PendingTransaction) =>
  getInputOutputBaseAddresses(tx.outputs ?? []).filter((address) => addressHasOnlyPositiveAmountDeltas(tx, address))

const getInputOutputBaseAddresses = (io: e.Input[] | e.Output[]): AddressHash[] =>
  uniq(io.map(getInputOutputBaseAddress).filter((address): address is string => address !== undefined))

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

// TODO: Delete
export const getTransactionInfoType = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction,
  addressHash: AddressHash,
  internalAddresses: AddressHash[],
  isInAddressDetailsModal?: boolean
): TransactionInfoType => {
  if (!isConfirmedTx(tx)) {
    return 'pending'
  } else if (isConsolidationTx(tx)) {
    return 'move'
  } else {
    const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

    if (hasPositiveAndNegativeAmounts(alphAmount, tokenAmounts)) {
      return 'swap'
    } else {
      const alphAmountReduced = alphAmount < 0 // tokenAmounts is checked in the swap condition
      const isInternalTransfer = isWalletSelfTransfer(tx, internalAddresses)

      if (
        (isInternalTransfer && isInAddressDetailsModal && alphAmountReduced) ||
        (isInternalTransfer && !isInAddressDetailsModal)
      ) {
        return 'move'
      } else {
        if (alphAmountReduced) {
          return 'out'
        } else {
          return 'in'
        }
      }
    }
  }
}
