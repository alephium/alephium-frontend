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

import { motion } from 'framer-motion'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { fadeIn } from '@/animations'
import { useAddressesListedFungibleTokens } from '@/api/addressesListedFungibleTokensDataHooks'
import { useAddressesTokensWorth } from '@/api/addressesTokensPricesDataHooks'
import { useAddressesUnlistedFungibleTokens } from '@/api/addressesUnlistedTokensHooks'
import SkeletonLoader from '@/components/SkeletonLoader'
import { ExpandRow, TableRow } from '@/components/Table'
import TokenBalancesRow from '@/features/assetsLists/TokenBalancesRow'
import { AssetsTabsProps } from '@/features/assetsLists/types'

const FungibleTokensBalancesList = ({ className, addressHash, isExpanded, onExpand }: AssetsTabsProps) => {
  const { data: addressesTokensWorth, isLoading: isLoadingTokensWorth } = useAddressesTokensWorth(addressHash)
  const { data: addressesListedFungibleTokens, isLoading: isLoadingListedFungibleTokens } =
    useAddressesListedFungibleTokens(addressHash)
  const { data: addressesUnlistedFungibleTokens, isLoading: isLoadingUnlistedFungibleTokens } =
    useAddressesUnlistedFungibleTokens(addressHash)

  const sortedTokenIds = useMemo(
    () =>
      [
        ...orderBy(
          addressesListedFungibleTokens,
          [(t) => addressesTokensWorth[t.id] ?? -1, (t) => t.name.toLowerCase()],
          ['desc', 'asc']
        ),
        ...orderBy(addressesUnlistedFungibleTokens, [(t) => t.name.toLowerCase(), 'id'], ['asc', 'asc'])
      ].map((token) => token.id),
    [addressesListedFungibleTokens, addressesTokensWorth, addressesUnlistedFungibleTokens]
  )

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {sortedTokenIds.map((tokenId) => (
          <TokenBalancesRow tokenId={tokenId} addressHash={addressHash} isExpanded={isExpanded} key={tokenId} />
        ))}
        {isLoadingTokensWorth ||
          isLoadingListedFungibleTokens ||
          (isLoadingUnlistedFungibleTokens && (
            <TableRow>
              <SkeletonLoader height="37.5px" />
            </TableRow>
          ))}
      </motion.div>

      {!isExpanded && sortedTokenIds.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

export default FungibleTokensBalancesList
