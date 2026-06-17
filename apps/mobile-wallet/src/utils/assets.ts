import { Asset, NFT } from '@alephium/shared/types'

export const isNft = (item: Asset | NFT): item is NFT => (item as NFT).collectionId !== undefined
