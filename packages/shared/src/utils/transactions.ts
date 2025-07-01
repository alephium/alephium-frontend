import {
  explorer as e,
  SignChainedTxParams,
  SignChainedTxResult,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'

import {
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx,
  isInternalTx
} from '@/transactions'
import { AddressHash } from '@/types/addresses'
import { AssetAmount, TokenApiBalances } from '@/types/assets'
import { SignChainedTxModalProps } from '@/types/signTxModalTypes'
import { SentTransaction, TransactionInfoType } from '@/types/transactions'

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
      const isInternalTransfer = isInternalTx(tx, internalAddresses)

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

export const shouldBuildSweepTransactions = (assetAmounts: AssetAmount[], tokensBalances: TokenApiBalances[]) =>
  assetAmounts.length === tokensBalances.length &&
  tokensBalances.every(({ id, totalBalance }) => {
    const assetAmount = assetAmounts.find((asset) => asset.id === id)

    return totalBalance === (assetAmount?.amount ?? 0).toString()
  })

export const getChainedTxPropsFromSignChainedTxParams = (
  txParams: Array<SignChainedTxParams>,
  unsignedData: Array<Omit<SignChainedTxResult, 'signature'>>
): SignChainedTxModalProps['props'] =>
  txParams.map(({ type, ...rest }, index) => {
    switch (type) {
      case 'Transfer': {
        return {
          type: 'TRANSFER',
          txParams: rest as SignTransferTxParams,
          unsignedData: unsignedData[index]
        }
      }
      case 'DeployContract': {
        return {
          type: 'DEPLOY_CONTRACT',
          txParams: rest as SignDeployContractTxParams,
          unsignedData: unsignedData[index]
        }
      }
      case 'ExecuteScript': {
        return {
          type: 'EXECUTE_SCRIPT',
          txParams: rest as SignExecuteScriptTxParams,
          unsignedData: unsignedData[index]
        }
      }
      default: {
        throw new Error(`Unsupported transaction type: ${type}`)
      }
    }
  })
