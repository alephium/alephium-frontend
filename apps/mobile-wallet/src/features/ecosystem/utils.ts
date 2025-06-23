import { AssetAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignExecuteScriptTxParams } from '@alephium/web3'
import { partition } from 'lodash'

import { buildCallContractTransaction } from '~/api/transactions'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { store } from '~/store/store'
import { SignExecuteScriptTxParamsWithAmounts } from '~/types/transactions'

export const calculateAssetAmountsSignExecuteScriptTx = ({
  tokens,
  attoAlphAmount
}: Pick<SignExecuteScriptTxParams, 'tokens' | 'attoAlphAmount'>): Array<AssetAmount> => {
  let assetAmounts: Array<AssetAmount> = []
  let allAlphAssets: Array<AssetAmount> = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

  if (tokens) {
    const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
    const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)
    assetAmounts = tokenAssets
    allAlphAssets = [...allAlphAssets, ...alphAssets]
  }

  if (allAlphAssets.length > 0) {
    assetAmounts.push({
      id: ALPH.id,
      amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
    })
  }

  return assetAmounts
}

export const processSignExecuteScriptTxParamsAndBuildTx = async (txParams: SignExecuteScriptTxParams) => {
  const assetAmounts = calculateAssetAmountsSignExecuteScriptTx({
    tokens: txParams.tokens,
    attoAlphAmount: txParams.attoAlphAmount
  })

  const txParamsWithAmounts: SignExecuteScriptTxParamsWithAmounts = { ...txParams, assetAmounts }

  store.dispatch(activateAppLoading('Loading'))
  const buildCallContractTxResult = await buildCallContractTransaction(txParamsWithAmounts)
  store.dispatch(deactivateAppLoading())

  return {
    txParamsWithAmounts,
    buildCallContractTxResult
  }
}
