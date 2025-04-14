import { NFTTokenUriMetaData } from '@alephium/web3'
import { isArray, orderBy } from 'lodash'

import { Asset } from '@/types'

export const sortAssets = (assets: Asset[]) =>
  orderBy(
    assets,
    [
      (a) => (a.verified ? 0 : 1),
      (a) => a.worth ?? -1,
      (a) => a.verified === undefined,
      (a) => a.name?.toLowerCase(),
      'id'
    ],
    ['asc', 'desc', 'asc', 'asc', 'asc']
  )

export const matchesNFTTokenUriMetaDataSchema = (nft: NFTTokenUriMetaData) =>
  typeof nft.name === 'string' &&
  typeof nft.image === 'string' &&
  (typeof nft.description === 'undefined' || typeof nft.description === 'string') &&
  (typeof nft.attributes === 'undefined' ||
    (isArray(nft.attributes) &&
      nft.attributes.every(
        (attr) =>
          typeof attr.trait_type === 'string' &&
          (typeof attr.value === 'string' || typeof attr.value === 'number' || typeof attr.value === 'boolean')
      )))
