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

import SkeletonLoader from '@/components/SkeletonLoader'
import { ExpandRow, TableRow } from '@/components/Table'
import TokenBalancesRow from '@/features/assetsLists/TokenBalancesRow'
import { AssetsTabsProps } from '@/features/assetsLists/types'
import useAddressesSortedFungibleTokens from '@/features/assetsLists/useSortedFungibleTokens'

const FungibleTokensBalancesList = ({
  className,
  addressHash,
  isExpanded,
  onExpand,
  maxHeightInPx
}: AssetsTabsProps) => {
  const { data, isLoading } = useAddressesSortedFungibleTokens(addressHash)

  return (
    <>
      <div className={className}>
        {data.map(({ id }) => (
          <TokenBalancesRow tokenId={id} addressHash={addressHash} isExpanded={isExpanded} key={id} />
        ))}
        {isLoading && (
          <TableRow>
            <SkeletonLoader height="37.5px" />
          </TableRow>
        )}
      </div>

      {!isExpanded && data.length > 3 && onExpand && <ExpandRow onClick={onExpand} maxHeightInPx={maxHeightInPx} />}
    </>
  )
}

export default FungibleTokensBalancesList
