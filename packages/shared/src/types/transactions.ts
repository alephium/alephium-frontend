import { explorer as e, Optional } from '@alephium/web3'

import { Asset, AssetAmount } from '@/types/assets'

export type TransactionInfoAsset = Optional<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>

export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  lockTime?: Date
}

export type TransactionDirection = 'out' | 'in' | 'swap'

export type TransactionInfoType = TransactionDirection | 'move' | 'pending'

export type AmountDeltas = {
  alphAmount: bigint
  tokenAmounts: {
    id: e.Token['id']
    amount: bigint
  }[]
}
