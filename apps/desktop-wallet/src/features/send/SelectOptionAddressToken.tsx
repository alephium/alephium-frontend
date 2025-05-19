import { AddressHash, isNFT } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances, useFetchToken } from '@alephium/shared-react'

import SelectOptionToken, { SelectOptionTokenBaseProps } from '@/components/Inputs/SelectOptionToken'

interface SelectOptionAddressTokenProps extends SelectOptionTokenBaseProps {
  addressHash: AddressHash
}

const SelectOptionAddressToken = ({ tokenId, addressHash, ...props }: SelectOptionAddressTokenProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)
  const isNft = token && isNFT(token)
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchAddressSingleTokenBalances({
    addressHash,
    tokenId,
    skip: isLoadingToken || isNft
  })

  const amount = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <SelectOptionToken
      tokenId={tokenId}
      amount={amount}
      showAmount={!isNft}
      isLoading={isLoadingTokenBalances}
      {...props}
    />
  )
}

export default SelectOptionAddressToken
