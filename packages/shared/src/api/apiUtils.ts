import { NFTCollectionUriMetaData } from '@alephium/web3'

export const matchesNFTCollectionUriMetaDataSchema = (nftCollection: NFTCollectionUriMetaData) =>
  typeof nftCollection.name === 'string' &&
  typeof nftCollection.image === 'string' &&
  typeof nftCollection.description === 'string'
