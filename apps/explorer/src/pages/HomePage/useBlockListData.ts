import { explorer } from '@alephium/web3'
import { useCallback, useEffect, useRef, useState } from 'react'

import client from '@/api/client'

export const BLOCKS_PER_PAGE = 10

// The backend indexes new blocks roughly every 5s, so polling faster would not surface fresher data.
export const BLOCKS_REFRESH_INTERVAL = 5000

const useBlockListData = (currentPageNumber: number) => {
  const [blockList, setBlockList] = useState<explorer.ListBlocks>()
  const [manualLoading, setManualLoading] = useState(false)
  const [newBlockHashes, setNewBlockHashes] = useState<Set<string>>(new Set())
  const seenBlockHashes = useRef<Set<string>>(new Set())

  const getBlocks = useCallback(async (pageNumber: number, manualFetch?: boolean) => {
    manualFetch && setManualLoading(true)

    try {
      const data = await client.explorer.blocks.getBlocks({ page: pageNumber, limit: BLOCKS_PER_PAGE })

      if (data) {
        const hashes = data.blocks?.map((b) => b.hash) ?? []

        // A manual fetch (initial load, page change) only sets a baseline; a poll flashes whatever arrived since.
        setNewBlockHashes(manualFetch ? new Set() : new Set(hashes.filter((h) => !seenBlockHashes.current.has(h))))
        seenBlockHashes.current = new Set(hashes)

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

  return { getBlocks, blockPageLoading: manualLoading, data: { blockList, newBlockHashes } }
}

export default useBlockListData
