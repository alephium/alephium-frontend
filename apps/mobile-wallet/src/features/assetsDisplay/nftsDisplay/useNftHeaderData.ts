import { NFT, NFTDataType, NFTDataTypes } from '@alephium/shared'
import { useFetchNft } from '@alephium/shared-react'
import { useEffect, useState } from 'react'
import { DimensionValue } from 'react-native'

export interface NFTImageProps {
  nftId: NFT['id']
  size?: DimensionValue
  play?: boolean
  sizeLimited?: boolean
}

interface UseNftHeaderDataProps {
  nftId: NFT['id']
  maxFileSizeInBytes: number
}

const useNftHeaderData = ({ nftId, maxFileSizeInBytes }: UseNftHeaderDataProps) => {
  const { data: nft } = useFetchNft({ id: nftId })

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
