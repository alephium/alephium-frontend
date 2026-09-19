import {
  AddressHash,
  ExecuteScriptTx,
  isFT,
  isNFT,
  ListedFT,
  NFT,
  NonStandardToken,
  SentTransaction,
  UnlistedFT
} from '@alephium/shared/types'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import { combineIsLoading } from '../../../api/apiDataHooks/apiDataHooksUtils'
import { tokenQuery } from '../../../api/queries/tokenQueries'
import { useTransactionAmountDeltas } from '../../../hooks/transactions/useTransactionAmountDeltas'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

type AmountDelta = { amount: bigint }
type TxFT = TxListedFT | TxUnlistedFT
type TxListedFT = ListedFT & AmountDelta
type TxUnlistedFT = UnlistedFT & AmountDelta
type TxNFT = NFT & AmountDelta
type TxNST = NonStandardToken & AmountDelta

type TransactionTokens = {
  data: {
    fungibleTokens: TxFT[]
    nfts: TxNFT[]
    nsts: TxNST[]
  }
  isLoading: boolean
}

export const useFetchTransactionTokens = (
  tx: e.Transaction | e.PendingTransaction | SentTransaction | ExecuteScriptTx,
  addressHash: AddressHash,
  skipCaching: boolean = false
): TransactionTokens => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, addressHash)

  const { data: tokens, isLoading } = useQueries({
    queries: tokenAmounts.map(({ id }) => tokenQuery({ id, networkId, skipCaching, isExplorerOnline })),
    combine: (results) => combineTokens(results, tokenAmounts)
  })

  return {
    data: useMemo(() => {
      // ALPH can reach us both as the alph delta and as a token entry, and the lists below are keyed by token id.
      const alphFromTokens = tokens.fungibleTokens.reduce(
        (sum, { id, amount }) => (id === ALPH.id ? sum + amount : sum),
        BigInt(0)
      )
      const totalAlphAmount = alphAmount + alphFromTokens
      const otherFungibleTokens = tokens.fungibleTokens.filter(({ id }) => id !== ALPH.id)

      return {
        fungibleTokens: (totalAlphAmount !== BigInt(0)
          ? [{ ...ALPH, amount: totalAlphAmount }, ...otherFungibleTokens]
          : otherFungibleTokens) as TxFT[],
        nfts: tokens.nfts,
        nsts: tokens.nsts
      }
    }, [alphAmount, tokens.fungibleTokens, tokens.nfts, tokens.nsts]),
    isLoading
  }
}

const combineTokens = (
  results: UseQueryResult<NonStandardToken, Error>[],
  tokenAmounts: { id: string; amount: bigint }[]
) => ({
  data: results.reduce(
    (acc, { data }) => {
      if (!data) return acc

      const amount = tokenAmounts.find(({ id }) => id === data.id)?.amount

      if (amount === undefined) return acc

      if (isFT(data)) {
        acc.fungibleTokens.push({ ...data, amount })
      } else if (isNFT(data)) {
        acc.nfts.push({ ...data, amount })
      } else {
        acc.nsts.push({ ...data, amount })
      }

      return acc
    },
    {
      fungibleTokens: [] as TxFT[],
      nfts: [] as TxNFT[],
      nsts: [] as TxNST[]
    } as TransactionTokens['data']
  ),
  ...combineIsLoading(results)
})
