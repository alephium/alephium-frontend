import { AddressHash } from '@alephium/shared'

import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import { AssetAmountInputType } from '@/types/assets'

const useAreAmountsWithinAddressAvailableBalances = (
  addressHash: AddressHash,
  amounts: AssetAmountInputType[]
): boolean => {
  const amountsWithBalance = amounts.filter(({ amount }) => !!amount)
  const { data: addressTokensBalances } = useFetchAddressBalances({
    addressHash,
    skip: amountsWithBalance.length === 0
  })

  return amountsWithBalance.every(({ id, amount }) => {
    const balances = addressTokensBalances.find((token) => token.id === id)

    return !amount ? true : !balances ? false : amount <= BigInt(balances.availableBalance)
  })
}

export default useAreAmountsWithinAddressAvailableBalances
