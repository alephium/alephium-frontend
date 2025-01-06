import { AddressHash } from '@alephium/shared'

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchToken, { isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import TokenBadge, { TokenBadgeStyleProps } from '@/components/TokenBadge'
import { TokenId } from '@/types/tokens'

interface AddressTokenBadgeProps extends TokenBadgeStyleProps {
  tokenId: TokenId
  addressHash: AddressHash
}

const AddressTokenBadge = ({ addressHash, tokenId, ...props }: AddressTokenBadgeProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)
  const { data, isLoading } = useFetchAddressSingleTokenBalances({
    addressHash,
    tokenId,
    skip: isNFT(token) || isLoadingToken
  })

  const amount = data?.totalBalance ? BigInt(data.totalBalance) : undefined

  return <TokenBadge {...props} tokenId={tokenId} amount={amount} isLoadingAmount={isLoading} />
}

export default AddressTokenBadge
