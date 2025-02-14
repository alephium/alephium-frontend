import { AddressHash, NFT } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { tokenQuery } from '@/api/queries/tokenQueries'
import useTransactionAmountDeltas from '@/features/transactionsDisplay/useTransactionAmountDeltas'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ListedFT, NonStandardToken, UnlistedFT } from '@/types/tokens'

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

const useFetchTransactionTokens = (
  tx: e.Transaction | e.PendingTransaction,
  addressHash: AddressHash
): TransactionTokens => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, addressHash)

  const {
    data: { listedFts, unlistedTokens },
    isLoading: isLoadingFtList
  } = useFetchTokensSeparatedByListing(tokenAmounts)

  const { data: tokens, isLoading: isLoadingTokens } = useQueries({
    queries: unlistedTokens.map(({ id }) => tokenQuery({ id, networkId, isLoadingFtList })),
    combine: (results) => combineTokens(results, tokenAmounts)
  })

  return {
    data: useMemo(
      () => ({
        fungibleTokens: [{ ...ALPH, amount: alphAmount }, ...listedFts, ...tokens.fungibleTokens] as TxFT[],
        nfts: tokens.nfts,
        nsts: tokens.nsts
      }),
      [alphAmount, listedFts, tokens.fungibleTokens, tokens.nfts, tokens.nsts]
    ),
    isLoading: isLoadingFtList || isLoadingTokens
  }
}

export default useFetchTransactionTokens

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
