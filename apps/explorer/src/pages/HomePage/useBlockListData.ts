import { explorer } from '@alephium/web3'
import { useCallback, useEffect, useState } from 'react'

import client from '@/api/client'

export const BLOCKS_PER_PAGE = 10

const useBlockListData = (currentPageNumber: number) => {
  const [blockList, setBlockList] = useState<explorer.ListBlocks>()
  const [manualLoading, setManualLoading] = useState(false)

  const getBlocks = useCallback(async (pageNumber: number, manualFetch?: boolean) => {
    manualFetch && setManualLoading(true)

    try {
      const data = await client.explorer.blocks.getBlocks({ page: pageNumber, limit: BLOCKS_PER_PAGE })

      if (data) setBlockList(data)
    } catch (e) {
      console.error(e)
    }

    manualFetch && setManualLoading(false)
  }, [])

  // Fetching Data when page number changes or page loads initially
  useEffect(() => {
    getBlocks(currentPageNumber, true)
  }, [getBlocks, currentPageNumber])

  return { getBlocks, blockPageLoading: manualLoading, data: { blockList } }
}

export default useBlockListData
