import { useTranslation } from 'react-i18next'

import useFetchAddressFts from '@/api/apiDataHooks/address/useFetchAddressFts'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import EmptyPlaceholder from '@/components/EmptyPlaceholder'
import SkeletonLoader from '@/components/SkeletonLoader'
import Table, { TableRow } from '@/components/Table'
import { AddressFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { WalletFTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import TokensBalancesHeader from '@/features/assetsLists/TokensBalancesHeader'
import { AddressDetailsTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'

export const AddressFTsBalancesList = ({ addressHash, ...props }: AddressDetailsTabsProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchAddressFts({ addressHash })
  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0

  return (
    <Table {...props}>
      {!isEmpty && <TokensBalancesHeader />}
      {listedFts.map(({ id }) => (
        <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
      ))}
      {unlistedFts.map(({ id }) => (
        <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
      ))}
      {!isLoading && listedFts.length === 0 && unlistedFts.length === 0 && (
        <EmptyPlaceholder>{t("This address doesn't have any tokens yet.")}</EmptyPlaceholder>
      )}
      {isLoading && <TokensSkeletonLoader />}
    </Table>
  )
}

export const WalletFTsBalancesList = (props: TokensTabsBaseProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchWalletFts()
  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0

  return (
    <Table {...props}>
      {!isEmpty && <TokensBalancesHeader />}
      {listedFts.map(({ id }) => (
        <WalletFTBalancesRow tokenId={id} key={id} />
      ))}
      {unlistedFts.map(({ id }) => (
        <WalletFTBalancesRow tokenId={id} key={id} />
      ))}
      {isEmpty && (
        <EmptyPlaceholder emoji="👀">
          {t("The wallet doesn't have any tokens. Tokens of all your addresses will appear here.")}
        </EmptyPlaceholder>
      )}
      {isLoading && <TokensSkeletonLoader />}
    </Table>
  )
}

const TokensSkeletonLoader = () => (
  <TableRow style={{ padding: 20 }}>
    <SkeletonLoader height="37.5px" />
  </TableRow>
)
