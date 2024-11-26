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

import { Token } from '@alephium/web3'
import { useTheme } from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'

interface FTPriceCellProps {
  tokenId: Token['id']
}

const FTPriceCell = ({ tokenId }: FTPriceCellProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <TableCell>
      <Price tokenSymbol={token.symbol} />
    </TableCell>
  )
}

const Price = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const { data: tokenPrice, isLoading } = useFetchTokenPrice(tokenSymbol)
  const theme = useTheme()

  if (tokenPrice === undefined || tokenPrice === null) return '-'

  return isLoading ? (
    <SkeletonLoader height="20px" width="30%" />
  ) : (
    <Amount isFiat value={tokenPrice} overrideSuffixColor color={theme.font.secondary} />
  )
}

export default FTPriceCell
