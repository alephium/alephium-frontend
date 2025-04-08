import { isNFT } from '@alephium/shared'
import { useFetchToken, useFetchWalletSingleTokenBalances } from '@alephium/shared-react'

import SelectOptionToken, { SelectOptionTokenBaseProps } from '@/components/Inputs/SelectOptionToken'

const SelectOptionWalletToken = ({ tokenId, ...props }: SelectOptionTokenBaseProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  const amount = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <SelectOptionToken
      tokenId={tokenId}
      amount={amount}
      showAmount={!!token && !isNFT(token)}
      isLoading={isLoadingTokenBalances}
      {...props}
    />
  )
}

export default SelectOptionWalletToken
