import { TokenId } from '@alephium/shared'
import { useInfiniteQuery } from '@tanstack/react-query'

const PAGE_SIZE = 12

interface UsePaginatedNFTsProps {
  nftIds: TokenId[]
  pageSize?: number
}

const usePaginatedNFTs = ({ nftIds, pageSize = PAGE_SIZE }: UsePaginatedNFTsProps) =>
  useInfiniteQuery({
    queryKey: ['paginatedNFTs', { nftIds, pageSize }],
    queryFn: ({ pageParam = 0 }) => {
      const start = pageParam * pageSize
      const end = start + pageSize
      const nfts = nftIds.slice(start, end)

      return {
        nfts,
        nextCursor: end < nftIds.length ? pageParam + 1 : undefined
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: nftIds.length > 0
  })

export default usePaginatedNFTs
