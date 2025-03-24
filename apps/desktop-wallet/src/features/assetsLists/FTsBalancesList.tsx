import { useTranslation } from 'react-i18next'

import useFetchAddressFtsSorted from '@/api/apiDataHooks/address/useFetchAddressFtsSorted'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletFtsSorted from '@/api/apiDataHooks/wallet/useFetchWalletFtsSorted'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import EmptyPlaceholder from '@/components/EmptyPlaceholder'
import SkeletonLoader from '@/components/SkeletonLoader'
import Table, { TableRow } from '@/components/Table'
import {
  AddressFTBalancesRow,
  AddressNSTBalancesRow
} from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import {
  WalletFTBalancesRow,
  WalletNSTBalancesRow
} from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import TokensBalancesHeader from '@/features/assetsLists/TokensBalancesHeader'
import {
  HiddenAddressTokensBalancesListSection,
  HiddenWalletTokensBalancesListSection
} from '@/features/hiddenTokens/HiddenTokensBalancesLists'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'

export const AddressFTsBalancesList = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchAddressFtsSorted(addressHash)
  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0
  const {
    data: { nstIds }
  } = useFetchAddressTokensByType(addressHash)

  return (
    <>
      <Table>
        {!isEmpty && <TokensBalancesHeader />}
        {listedFts.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {unlistedFts.map(({ id }) => (
          <AddressFTBalancesRow tokenId={id} addressHash={addressHash} key={id} />
        ))}
        {nstIds.map((tokenId) => (
          <AddressNSTBalancesRow addressHash={addressHash} tokenId={tokenId} key={tokenId} />
        ))}
        {!isLoading && listedFts.length === 0 && unlistedFts.length === 0 && nstIds.length === 0 && (
          <EmptyPlaceholder emoji="👀">{t("This address doesn't have any tokens yet.")}</EmptyPlaceholder>
        )}
        {isLoading && <TokensSkeletonLoader />}
      </Table>
      <HiddenAddressTokensBalancesListSection addressHash={addressHash} />
    </>
  )
}

export const WalletFTsBalancesList = () => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchWalletFtsSorted()
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeHidden: false })

  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0

  return (
    <>
      <Table>
        {!isEmpty && <TokensBalancesHeader showAllocation />}
        {listedFts.map(({ id }) => (
          <WalletFTBalancesRow tokenId={id} key={id} />
        ))}
        {unlistedFts.map(({ id }) => (
          <WalletFTBalancesRow tokenId={id} key={id} />
        ))}
        {nstIds.map((tokenId) => (
          <WalletNSTBalancesRow tokenId={tokenId} key={tokenId} />
        ))}
        {isEmpty && (
          <EmptyPlaceholder emoji="👀">
            {t("The wallet doesn't have any tokens. Tokens of all your addresses will appear here.")}
          </EmptyPlaceholder>
        )}
        {isLoading && <TokensSkeletonLoader />}
      </Table>
      <HiddenWalletTokensBalancesListSection />
    </>
  )
}

const TokensSkeletonLoader = () => (
  <TableRow style={{ padding: 20 }}>
    <SkeletonLoader height="37.5px" />
  </TableRow>
)
