import { useMemo } from 'react'

import { ListedFT, TokenId, UnlistedFT } from '@/types/tokens'

interface UseSortedTokenIdsProps {
  listedFts: ListedFT[]
  unlistedFts: UnlistedFT[]
  nftIds: TokenId[]
  nstIds: TokenId[]
}

const useSortedTokenIds = ({ listedFts, unlistedFts, nftIds, nstIds }: UseSortedTokenIdsProps) =>
  useMemo(
    () => [...listedFts.map(({ id }) => id), ...unlistedFts.map(({ id }) => id), ...nftIds, ...nstIds],
    [listedFts, nftIds, nstIds, unlistedFts]
  )

export default useSortedTokenIds
