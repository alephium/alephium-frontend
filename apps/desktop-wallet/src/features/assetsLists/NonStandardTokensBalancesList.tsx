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

import { fadeIn } from '@/animations'
import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import { ExpandRow } from '@/components/Table'
import TokenBalancesRow from '@/features/assetsLists/TokenBalancesRow'
import { AssetsTabsProps } from '@/features/assetsLists/types'

const NonStandardTokensBalancesList = ({ className, addressHash, isExpanded, onExpand }: AssetsTabsProps) => {
  const { data: addressesNonStandardTokenIds } = useAddressesUnlistedNonStandardTokenIds(addressHash)

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {addressesNonStandardTokenIds.map((tokenId) => (
          <TokenBalancesRow tokenId={tokenId} addressHash={addressHash} isExpanded={isExpanded} key={tokenId} />
        ))}
      </motion.div>

      {!isExpanded && addressesNonStandardTokenIds.length > 3 && onExpand && <ExpandRow onClick={onExpand} />}
    </>
  )
}

export default NonStandardTokensBalancesList
