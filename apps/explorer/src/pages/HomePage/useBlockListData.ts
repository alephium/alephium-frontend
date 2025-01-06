import { explorer } from '@alephium/web3'
import { useCallback, useEffect, useState } from 'react'

import client from '@/api/client'

const useBlockListData = (currentPageNumber: number) => {
  const [blockList, setBlockList] = useState<explorer.ListBlocks>()
  const [manualLoading, setManualLoading] = useState(false)

  const getBlocks = useCallback(async (pageNumber: number, manualFetch?: boolean) => {
    console.log('Fetching blocks...')

    manualFetch && setManualLoading(true)

    try {
      const data = await client.explorer.blocks.getBlocks({ page: pageNumber, limit: 8 })

      if (data) {
        console.log('Number of block fetched: ' + data.blocks?.length)
        setBlockList(data)
      }
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
