import {
  AddressWithGroup,
  getMissingBalancesChainedTxParams,
  getTransactionExpectedBalances,
  TokenId,
  TransactionParams,
  UnlistedFT
} from '@alephium/shared'
import { explorer as e, NFTTokenUriMetaData, SignChainedTxParams } from '@alephium/web3'
import { isArray } from 'lodash'

import { addressBalancesQuery } from '@/api/queries/addressQueries'
import { queryClient } from '@/api/queryClient'

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

export const getSignerMissingBalances = async (
  expectedBalances: Map<TokenId, bigint>,
  signerAddress: string,
  networkId: number | undefined
) => {
  const missingBalances: Map<TokenId, bigint> = new Map()

  const { balances: signerBalances } = await queryClient.fetchQuery(
    addressBalancesQuery({ addressHash: signerAddress, networkId })
  )

  for (const [tokenId, amount] of expectedBalances) {
    const balance = signerBalances.find((balance) => balance.id === tokenId)

    if (!balance) {
      missingBalances.set(tokenId, amount)
    } else if (BigInt(balance.availableBalance) < amount) {
      missingBalances.set(tokenId, amount - BigInt(balance.availableBalance))
    }
  }

  return missingBalances
}

export const getAddressWithEnoughBalances = async (
  missingBalances: Map<TokenId, bigint>,
  addresses: AddressWithGroup[],
  networkId: number | undefined
): Promise<AddressWithGroup | undefined> => {
  if (missingBalances.size > 0) {
    const missingBalancesArray = Array.from(missingBalances.entries())

    for (const address of addresses) {
      const { balances: addressBalances } = await queryClient.fetchQuery(
        addressBalancesQuery({ addressHash: address.hash, networkId })
      )

      const hasEnoughBalances = missingBalancesArray.every(([tokenId, missingAmount]) => {
        const balance = addressBalances.find((balance) => balance.id === tokenId)

        return !!balance && BigInt(balance.availableBalance) >= missingAmount
      })

      if (hasEnoughBalances) {
        return address
      }
    }
  }
}

interface GetRefillMissingBalancesChainedTxParamsProps {
  transactionParams: TransactionParams
  addressesWithGroup: AddressWithGroup[]
  networkId: number | undefined
}

export const getRefillMissingBalancesChainedTxParams = async ({
  transactionParams,
  addressesWithGroup,
  networkId
}: GetRefillMissingBalancesChainedTxParamsProps): Promise<Array<SignChainedTxParams> | undefined> => {
  // 1. Make a list of all tokens needed for the tx
  const signerAddress = transactionParams.params.signerAddress
  const expectedBalances = getTransactionExpectedBalances(transactionParams)

  // 2. Find another address with the missing balances
  const signerMissingBalances = await getSignerMissingBalances(expectedBalances, signerAddress, networkId)
  const remainingAddresses = addressesWithGroup.filter(({ hash }) => hash !== signerAddress)
  const address = await getAddressWithEnoughBalances(signerMissingBalances, remainingAddresses, networkId)

  if (address) {
    const chainedTxParams = getMissingBalancesChainedTxParams(
      signerMissingBalances,
      address,
      signerAddress,
      transactionParams
    )

    return chainedTxParams
  }
}
