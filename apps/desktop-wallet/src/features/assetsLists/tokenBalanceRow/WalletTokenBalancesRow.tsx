import styled from 'styled-components'

import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import { TableRow } from '@/components/Table'
import AmountsColumn, { RawAmountSubtitle } from '@/features/assetsLists/tokenBalanceRow/AmountsColumn'
import FTWorth from '@/features/assetsLists/tokenBalanceRow/FTWorth'
import { FTNameColumn, NSTNameColumn } from '@/features/assetsLists/tokenBalanceRow/NameColumns'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenBalancesRowAmountsProps, TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const WalletFTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <FTNameColumn tokenId={tokenId} />
      <FTAmounts tokenId={tokenId} />
    </TokenRow>
  </TableRow>
)

export const WalletNSTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <TokenLogo tokenId={tokenId} />
      <NSTNameColumn tokenId={tokenId} />
      <WalletTokenBalancesRowAmounts tokenId={tokenId}>
        <RawAmountSubtitle />
      </WalletTokenBalancesRowAmounts>
    </TokenRow>
  </TableRow>
)

const FTAmounts = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { data: walletTokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  const totalBalance = walletTokenBalances?.totalBalance ? BigInt(walletTokenBalances.totalBalance) : undefined

  return (
    <WalletTokenBalancesRowAmounts tokenId={tokenId}>
      <FTWorth tokenId={tokenId} totalBalance={totalBalance} isLoadingBalance={isLoadingTokenBalances} />
    </WalletTokenBalancesRowAmounts>
  )
}

const WalletTokenBalancesRowAmounts = ({ tokenId, children }: TokenBalancesRowAmountsProps) => {
  const { data: walletTokenBalances, isLoading: isLoadingTokenBalances } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  const totalBalance = walletTokenBalances?.totalBalance ? BigInt(walletTokenBalances.totalBalance) : undefined
  const availableBalance = walletTokenBalances?.availableBalance
    ? BigInt(walletTokenBalances.availableBalance)
    : undefined

  return (
    <AmountsColumn
      isLoading={isLoadingTokenBalances}
      totalBalance={totalBalance}
      availableBalance={availableBalance}
      tokenId={tokenId}
    >
      {children}
    </AmountsColumn>
  )
}

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`
