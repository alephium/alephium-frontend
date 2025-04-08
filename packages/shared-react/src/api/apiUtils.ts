import { UnlistedFT } from '@alephium/shared'
import { explorer as e, NFTTokenUriMetaData } from '@alephium/web3'
import { isArray } from 'lodash'

interface GetQueryConfigProps {
  gcTime: number
  staleTime?: number
  networkId?: number
}

export const getQueryConfig = ({ staleTime, gcTime, networkId }: GetQueryConfigProps) => ({
  staleTime,
  gcTime,
  meta: { isMainnet: networkId === 0 }
})

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

export const convertTokenDecimalsToNumber = (token: e.FungibleTokenMetadata): UnlistedFT => {
  const parsedDecimals = parseInt(token.decimals)

  return {
    ...token,
    decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
  }
}

export const getFulfilledValues = <T>(results: PromiseSettledResult<T>[]) =>
  results
    .filter((result): result is PromiseFulfilledResult<T> => result.status === 'fulfilled')
    .map(({ value }) => value)
