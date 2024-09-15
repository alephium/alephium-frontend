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

import useAddressFTs from '@/api/apiDataHooks/address/useAddressFTs'
import SkeletonLoader from '@/components/SkeletonLoader'
import { AddressFTBalancesRow } from '@/features/assetsLists/AddressTokenBalancesRow'
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import TokenBalancesRow from '@/features/assetsLists/TokenBalancesRow'
import TokensSkeletonLoader from '@/features/assetsLists/TokensSkeletonLoader'
import { AddressTokensTabsProps, WalletTokensTabsProps } from '@/features/assetsLists/types'
import useAddressesSortedFungibleTokens from '@/features/assetsLists/useSortedFungibleTokens'

export const AddressFTsBalancesList = ({ addressHash, isExpanded, className, onExpand }: AddressTokensTabsProps) => {
  const { listedFTs, unlistedFTs, isLoading } = useAddressFTs({ addressHash })

  return (
    <>
      <motion.div className={className}>
        {listedFTs.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {unlistedFTs.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {isLoading && <SkeletonLoader />}
      </motion.div>

      <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} nbOfRows={listedFTs.length + unlistedFTs.length} />
    </>
  )
}

// TODO: Rework
export const WalletFTsBalancesList = ({ isExpanded, className, onExpand }: WalletTokensTabsProps) => {
  const { data, isLoading } = useAddressesSortedFungibleTokens()

  return (
    <>
      <motion.div className={className}>
        {data.map(({ id }) => (
          // TODO: Rework
          <TokenBalancesRow tokenId={id} isExpanded={isExpanded} key={id} />
        ))}
        {isLoading && <TokensSkeletonLoader />}
      </motion.div>

      <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} nbOfRows={data.length} />
    </>
  )
}
