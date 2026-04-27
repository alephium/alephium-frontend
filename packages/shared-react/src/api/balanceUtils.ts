import {
  AddressWithGroup,
  getMissingBalancesChainedTxParams,
  getTransactionExpectedBalances,
  TokenId,
  TransactionParams
} from '@alephium/shared'
import { SignChainedTxParams } from '@alephium/web3'

import { addressBalancesQuery } from '../api/queries/addressQueries'
import { queryClient } from '../api/queryClient'

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
