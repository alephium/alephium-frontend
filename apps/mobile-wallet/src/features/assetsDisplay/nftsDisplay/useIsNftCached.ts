import { NFT, selectNFTById } from '@alephium/shared'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'

import { selectHasNftModalOpened } from '~/features/modals/modalSelectors'
import { useAppSelector } from '~/hooks/redux'

const useIsNftCached = (nftId: NFT['id']) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const hasNftModalOpened = useAppSelector((s) => selectHasNftModalOpened(s, nftId))

  const [isCached, setIsCached] = useState<boolean>()

  useEffect(() => {
    if (hasNftModalOpened) {
      setIsCached(true)
    } else if (!isCached && nft?.image) {
      Image.getCachePathAsync(nft.image).then((cachePath) => setIsCached(!!cachePath))
    }
  }, [hasNftModalOpened, isCached, nft?.image])

  return isCached
}

export default useIsNftCached
