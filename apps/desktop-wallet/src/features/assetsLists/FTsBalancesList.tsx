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
import useWalletFTs from '@/api/apiDataHooks/wallet/useWalletFTs'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import { AddressFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { WalletFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'

export const AddressFTsBalancesList = ({ addressHash, isExpanded, className, onExpand }: AddressTokensTabsProps) => {
  const { listedFTs, unlistedFTs, isLoading } = useAddressFTs({ addressHash })

  const nbOfItems = listedFTs.length + unlistedFTs.length

  return (
    <>
      <motion.div className={className}>
        {listedFTs.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {unlistedFTs.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {isLoading && <TokensSkeletonLoader />}
      </motion.div>

      <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} isEnabled={nbOfItems > 3} />
    </>
  )
}

export const WalletFTsBalancesList = ({ isExpanded, className, onExpand }: TokensTabsBaseProps) => {
  const { listedFTs, unlistedFTs, isLoading } = useWalletFTs()

  const nbOfItems = listedFTs.length + unlistedFTs.length

  return (
    <>
      <motion.div className={className}>
        {listedFTs.map(({ id }) => (
          <WalletFTBalancesRow tokenId={id} key={id} />
        ))}
        {unlistedFTs.map(({ id }) => (
          <WalletFTBalancesRow tokenId={id} key={id} />
        ))}
        {isLoading && <TokensSkeletonLoader />}
      </motion.div>

      <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} isEnabled={nbOfItems > 3} />
    </>
  )
}

const TokensSkeletonLoader = () => (
  <TableRow>
    <SkeletonLoader height="37.5px" />
  </TableRow>
)