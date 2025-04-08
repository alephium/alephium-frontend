import { ListedFT, TokenId, UnlistedFT } from '@alephium/shared'
import { useMemo } from 'react'

interface UseSortedTokenIdsProps {
  listedFts: ListedFT[]
  unlistedFts: UnlistedFT[]
  nftIds: TokenId[]
  nstIds: TokenId[]
}

export const useSortedTokenIds = ({ listedFts, unlistedFts, nftIds, nstIds }: UseSortedTokenIdsProps) =>
  useMemo(
    () => [...listedFts.map(({ id }) => id), ...unlistedFts.map(({ id }) => id), ...nftIds, ...nstIds],
    [listedFts, nftIds, nstIds, unlistedFts]
  )
