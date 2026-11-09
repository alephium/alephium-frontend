import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'

export const blocksQueries = {
  list: (page: number, limit: number) =>
    queryOptions({
      queryKey: ['blocks', 'list', page, limit],
      queryFn: ({ signal }) => client.explorer.blocks.getBlocks({ page, limit }, { signal })
    }),
  block: {
    one: (blockHash: string) =>
      queryOptions({
        queryKey: ['block', blockHash],
        queryFn: () => client.explorer.blocks.getBlocksBlockHash(blockHash)
      }),
    uncle: (blockHash: string) =>
      queryOptions({
        queryKey: ['uncleBlock', blockHash],
        queryFn: () => client.node.blockflow.getBlockflowMainChainBlockByGhostUncleGhostUncleHash(blockHash)
      }),
    transactions: (blockHash: string, page: number = 1) =>
      queryOptions({
        queryKey: ['blockTransactions', blockHash, page],
        queryFn: ({ pageParam }) => client.explorer.blocks.getBlocksBlockHashTransactions(blockHash, { page })
      })
  }
}
