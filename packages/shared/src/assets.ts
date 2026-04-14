import { NFTTokenUriMetaData } from '@alephium/web3'

import { Asset } from './types'

export const sortAssets = (assets: Asset[]) =>
  [...assets].sort((a, b) => {
    const verifiedA = a.verified ? 0 : 1
    const verifiedB = b.verified ? 0 : 1
    if (verifiedA !== verifiedB) return verifiedA - verifiedB

    const worthA = a.worth ?? -1
    const worthB = b.worth ?? -1
    if (worthA !== worthB) return worthB - worthA

    const undefinedA = a.verified === undefined ? 1 : 0
    const undefinedB = b.verified === undefined ? 1 : 0
    if (undefinedA !== undefinedB) return undefinedA - undefinedB

    const nameA = a.name?.toLowerCase() ?? ''
    const nameB = b.name?.toLowerCase() ?? ''
    if (nameA !== nameB) return nameA < nameB ? -1 : 1

    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })

export const matchesNFTTokenUriMetaDataSchema = (nft: NFTTokenUriMetaData) =>
  typeof nft.name === 'string' &&
  typeof nft.image === 'string' &&
  (typeof nft.description === 'undefined' || typeof nft.description === 'string') &&
  (typeof nft.attributes === 'undefined' ||
    (Array.isArray(nft.attributes) &&
      nft.attributes.every(
        (attr) =>
          typeof attr.trait_type === 'string' &&
          (typeof attr.value === 'string' || typeof attr.value === 'number' || typeof attr.value === 'boolean')
      )))
