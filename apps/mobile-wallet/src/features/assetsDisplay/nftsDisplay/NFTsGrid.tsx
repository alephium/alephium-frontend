import { NFT } from '@alephium/shared'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { ForwardedRef, forwardRef } from 'react'

import useNftsGridFlashListProps, {
  UseNftsGridFlashListPropsProps
} from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'

type NFTsGridProps = Omit<
  Partial<FlashListProps<NFT[] | NFT['collectionId']>>,
  'contentContainerStyle' | 'renderItem' | 'keyExtractor' | 'getItemType'
> &
  UseNftsGridFlashListPropsProps

const NFTsGrid = forwardRef(
  (
    { nfts, nftSize, nftsPerRow = 3, isLoading, ...props }: NFTsGridProps,
    ref: ForwardedRef<FlashList<NFT[] | NFT['collectionId']>>
  ) => {
    const flashListProps = useNftsGridFlashListProps({ nfts, nftSize, nftsPerRow, isLoading })

    return <FlashList {...props} {...flashListProps} ref={ref} />
  }
)

export default NFTsGrid
