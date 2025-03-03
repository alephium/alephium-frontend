import { NFT, selectNFTById } from '@alephium/shared'
import { useEffect, useState } from 'react'
import { DimensionValue } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

export interface NFTImageProps {
  nftId: NFT['id']
  size?: DimensionValue
  play?: boolean
  sizeLimited?: boolean
}

enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

type NFTDataType = keyof typeof NFTDataTypes

interface UseNftHeaderDataProps {
  nftId: NFT['id']
  maxFileSizeInBytes: number
}

const useNftHeaderData = ({ nftId, maxFileSizeInBytes }: UseNftHeaderDataProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))

  const [contentType, setContentType] = useState<NFTDataType>()
  const [isLargeFile, setIsLargeFile] = useState<boolean>()

  useEffect(() => {
    if (nft?.image) {
      fetch(nft.image, { method: 'HEAD' }).then((res) => {
        const contentType = res.headers.get('content-type') || ''
        const contentTypeCategory = contentType.split('/')[0]
        const contentLength = res.headers.get('content-length')
        const isLargeFile = contentLength ? parseInt(contentLength) > maxFileSizeInBytes : false

        setIsLargeFile(isLargeFile)
        setContentType(contentTypeCategory in NFTDataTypes ? (contentTypeCategory as NFTDataType) : 'other')
      })
    }
  }, [maxFileSizeInBytes, nft?.image])

  return {
    contentType,
    isLargeFile
  }
}

export default useNftHeaderData
