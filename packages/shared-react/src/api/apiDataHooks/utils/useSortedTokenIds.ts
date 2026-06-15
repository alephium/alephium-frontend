import { ListedFT, TokenId, UnlistedFT } from '@alephium/shared/types'
import { useMemo } from 'react'

interface UseSortedTokenIdsProps {
  sortedFts: (ListedFT | UnlistedFT)[]
  nftIds: TokenId[]
  nstIds: TokenId[]
}

export const useSortedTokenIds = ({ sortedFts, nftIds, nstIds }: UseSortedTokenIdsProps) =>
  useMemo(() => [...sortedFts.map(({ id }) => id), ...nftIds, ...nstIds], [nftIds, nstIds, sortedFts])
