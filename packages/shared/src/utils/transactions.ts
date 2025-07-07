import { ALPH } from '@alephium/token-list'
import {
  DUST_AMOUNT,
  explorer as e,
  SignChainedTxParams,
  SignChainedTxResult,
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult
} from '@alephium/web3'

import { MAXIMAL_GAS_FEE } from '@/constants'
import {
  calcTxAmountsDeltaForAddress,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx,
  isInternalTx
} from '@/transactions'
import { AddressHash } from '@/types/addresses'
import { AssetAmount, TokenApiBalances } from '@/types/assets'
import { SignChainedTxModalProps, SignChainedTxModalResult } from '@/types/signTxModalTypes'
import { SendFlowData, SentTransaction, SweepTxParams, TransactionInfoType } from '@/types/transactions'

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

export const signChainedTxResultsToTxSubmittedResults = (
  results: Array<SignChainedTxResult>,
  txParams: Array<SignChainedTxParams>
): SignChainedTxModalResult =>
  results.map(({ type, ...rest }, index) => {
    switch (type) {
      case 'Transfer': {
        return {
          type: 'TRANSFER',
          result: rest as SignTransferTxResult,
          txParams: txParams[index] as SignTransferTxParams
        }
      }
      case 'DeployContract': {
        return {
          type: 'DEPLOY_CONTRACT',
          result: rest as SignDeployContractTxResult,
          txParams: txParams[index] as SignDeployContractTxParams
        }
      }
      case 'ExecuteScript': {
        return {
          type: 'EXECUTE_SCRIPT',
          result: rest as SignExecuteScriptTxResult,
          txParams: txParams[index] as SignExecuteScriptTxParams
        }
      }
      default: {
        throw new Error(`Unsupported transaction type: ${type}`)
      }
    }
  })

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)
  const minDiff = minAlphAmountRequirement - alphAmount
  const totalAlphAmount = minDiff > 0 ? alphAmount + minDiff : alphAmount

  return {
    attoAlphAmount: totalAlphAmount.toString(),
    extraAlphForDust: minAlphAmountRequirement,
    tokens
  }
}

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

export const getTransferTxParams = (data: SendFlowData): SignTransferTxParams => {
  const { fromAddress, toAddress, assetAmounts, gasAmount, gasPrice, lockTime } = data
  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

  return {
    signerAddress: fromAddress.hash,
    signerKeyType: fromAddress.keyType,
    destinations: [{ address: toAddress, attoAlphAmount, tokens, lockTime: lockTime ? lockTime.getTime() : undefined }],
    gasAmount: gasAmount ? gasAmount : undefined,
    gasPrice: gasPrice ? BigInt(gasPrice) : undefined
  }
}

export const getGasRefillChainedTxParams = (
  groupedAddressWithEnoughAlphForGas: string,
  data: SendFlowData
): Array<SignChainedTxParams> => [
  {
    type: 'Transfer',
    signerAddress: groupedAddressWithEnoughAlphForGas,
    signerKeyType: 'default',
    destinations: [{ address: data.fromAddress.hash, attoAlphAmount: MAXIMAL_GAS_FEE }]
  },
  {
    type: 'Transfer',
    ...getTransferTxParams(data)
  }
]

export const getSweepTxParams = (data: SendFlowData): SweepTxParams => ({
  signerAddress: data.fromAddress.hash,
  signerKeyType: data.fromAddress.keyType,
  toAddress: data.toAddress,
  lockTime: data.lockTime?.getTime()
})
