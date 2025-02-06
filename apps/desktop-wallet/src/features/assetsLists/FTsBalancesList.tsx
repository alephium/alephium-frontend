import { EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchAddressFts from '@/api/apiDataHooks/address/useFetchAddressFts'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import useFetchWalletFts from '@/api/apiDataHooks/wallet/useFetchWalletFts'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import Button from '@/components/Button'
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
import { AddressDetailsTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'
import { useAppSelector } from '@/hooks/redux'

export const AddressFTsBalancesList = ({ addressHash, ...props }: AddressDetailsTabsProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchAddressFts({ addressHash })
  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0

  const {
    data: { nstIds }
  } = useFetchAddressTokensByType({ addressHash, includeAlph: false })

  return (
    <Table {...props}>
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
        <EmptyPlaceholder>{t("This address doesn't have any tokens yet.")}</EmptyPlaceholder>
      )}
      {isLoading && <TokensSkeletonLoader />}
    </Table>
  )
}

export const WalletFTsBalancesList = (props: TokensTabsBaseProps) => {
  const { t } = useTranslation()
  const { listedFts, unlistedFts, isLoading } = useFetchWalletFts({ includeHidden: false, sort: true })
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeAlph: false, includeHidden: false })

  const isEmpty = !isLoading && listedFts.length === 0 && unlistedFts.length === 0

  return (
    <>
      <Table {...props}>
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
      <HiddenTokensBalancesListSection {...props} />
    </>
  )
}

const TokensSkeletonLoader = () => (
  <TableRow style={{ padding: 20 }}>
    <SkeletonLoader height="37.5px" />
  </TableRow>
)

const HiddenTokensBalancesListSection = (props: TokensTabsBaseProps) => {
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)
  const { t } = useTranslation()

  const [showHiddenTokensBalancesList, setShowHiddenTokensBalancesList] = useState(false)

  const toggleHiddenTokensBalancesList = () => setShowHiddenTokensBalancesList((prev) => !prev)

  if (hiddenTokenIds.length === 0) return null

  return (
    <>
      <ButtonStyled Icon={EyeOff} role="secondary" onClick={toggleHiddenTokensBalancesList} short>
        {showHiddenTokensBalancesList ? t('Hide assets') : t('nb_of_hidden_assets', { count: hiddenTokenIds.length })}
      </ButtonStyled>
      {showHiddenTokensBalancesList && <HiddenTokensBalancesList {...props} />}
    </>
  )
}

const HiddenTokensBalancesList = (props: TokensTabsBaseProps) => {
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)

  return (
    <Table {...props}>
      {hiddenTokenIds.map((tokenId) => (
        <WalletHiddenTokenBalancesRow tokenId={tokenId} key={tokenId} />
      ))}
    </Table>
  )
}

const WalletHiddenTokenBalancesRow = ({ tokenId }: { tokenId: string }) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token) return null

  return isFT(token) ? (
    <WalletFTBalancesRow tokenId={tokenId} />
  ) : !isNFT(token) ? (
    <WalletNSTBalancesRow tokenId={tokenId} key={tokenId} />
  ) : null
}

const ButtonStyled = styled(Button)`
  margin: var(--spacing-4) auto;
`
