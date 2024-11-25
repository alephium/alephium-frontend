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

import { useTranslation } from 'react-i18next'

import useFetchAddressFts from '@/api/apiDataHooks/address/useFetchAddressFts'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'
import ExpandableTokensBalancesList from '@/features/assetsLists/ExpandableTokensBalancesList'
import PlaceholderText from '@/features/assetsLists/PlaceholderText'
import { AddressFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { WalletFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'

export const AddressFTsBalancesList = ({ addressHash, ...props }: AddressTokensTabsProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchAddressFts({ addressHash })

  return (
    <ExpandableTokensBalancesList {...props}>
      {listedFts.map(({ id }) => (
        <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
      ))}
      {unlistedFts.map(({ id }) => (
        <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
      ))}
      {!isLoading && listedFts.length === 0 && unlistedFts.length === 0 && (
        <PlaceholderText>{t("This address doesn't have any tokens yet.")}</PlaceholderText>
      )}
      {isLoading && <TokensSkeletonLoader />}
    </ExpandableTokensBalancesList>
  )
}

export const WalletFTsBalancesList = (props: TokensTabsBaseProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchWalletFts()

  return (
    <ExpandableTokensBalancesList {...props} nbOfItems={listedFts.length + unlistedFts.length}>
      {listedFts.map(({ id }) => (
        <WalletFTBalancesRow tokenId={id} key={id} />
      ))}
      {unlistedFts.map(({ id }) => (
        <WalletFTBalancesRow tokenId={id} key={id} />
      ))}
      {!isLoading && listedFts.length === 0 && unlistedFts.length === 0 && (
        <PlaceholderText>
          {t("The wallet doesn't have any tokens. Tokens of all your addresses will appear here.")}
        </PlaceholderText>
      )}
      {isLoading && <TokensSkeletonLoader />}
    </ExpandableTokensBalancesList>
  )
}

const TokensSkeletonLoader = () => (
  <TableRow style={{ padding: 20 }}>
    <SkeletonLoader height="37.5px" />
  </TableRow>
)
