/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchToken, { isNFT } from '@/api/apiDataHooks/tokens/useFetchToken'
import TokenBadge, { TokenBadgeStyleProps } from '@/components/TokenBadge'
import { TokenId } from '@/types/tokens'

interface AddressTokenBadgeProps extends TokenBadgeStyleProps {
  tokenId: TokenId
  addressHash: AddressHash
}

const AddressTokenBadge = ({ addressHash, tokenId, ...props }: AddressTokenBadgeProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data, isLoading } = useFetchAddressSingleTokenBalances({ addressHash, tokenId, skip: isNFT(token) })

  return <TokenBadge {...props} tokenId={tokenId} amount={data?.totalBalance} isLoading={isLoading} />
}

export default AddressTokenBadge
