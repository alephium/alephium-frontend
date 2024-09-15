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

import { AddressHash, calculateAmountWorth } from '@alephium/shared'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useAddressTokenBalances from '@/api/apiDataHooks/address/useAddressTokenBalances'
import useToken, { isFT, isUnlistedFT } from '@/api/apiDataHooks/useToken'
import { useTokenPrice } from '@/api/apiDataHooks/useTokenPrices'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import Truncate from '@/components/Truncate'

interface TokenBalancesRowBaseProps {
  tokenId: string
}

interface AddressTokenBalancesRowProps extends TokenBalancesRowBaseProps {
  addressHash: AddressHash
}

export const AddressFTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <AssetLogoStyled tokenId={tokenId} size={30} />
      <FTName tokenId={tokenId} />
      <FTAmounts tokenId={tokenId} addressHash={addressHash} />
    </TokenRow>
  </TableRow>
)

export const AddressNSTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TableRow key={tokenId} role="row">
    <TokenRow>
      <AssetLogoStyled tokenId={tokenId} size={30} />
      <NSTName tokenId={tokenId} />
      <NSTAmounts tokenId={tokenId} addressHash={addressHash} />
    </TokenRow>
  </TableRow>
)

const FTName = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()
  const { data: token } = useToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <NameColumn>
      <TokenName>
        {token.name}

        {isUnlistedFT(token) && (
          <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
            i
          </InfoIcon>
        )}
      </TokenName>

      <TokenSymbol>{token.symbol}</TokenSymbol>
    </NameColumn>
  )
}

const NSTName = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()

  return (
    <NameColumn>
      <TokenName>
        <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} />
      </TokenName>
    </NameColumn>
  )
}

const FTAmounts = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => {
  const { data: token } = useToken(tokenId)

  const symbol = isFT(token) ? token.symbol : undefined

  const { data: tokenPrice, isLoading: isLoadingTokenPrice } = useTokenPrice(symbol ? { symbol } : { skip: true })
  const { data: addressTokenBalances, isLoading: isLoadingTokenBalances } = useAddressTokenBalances(
    addressHash,
    tokenId
  )

  if (!isFT(token)) return null

  const totalBalance = addressTokenBalances?.balances.totalBalance
  const worth =
    totalBalance !== undefined && tokenPrice !== undefined
      ? calculateAmountWorth(totalBalance, tokenPrice.price, token.decimals)
      : undefined

  return (
    <AddressTokenBalancesRowAmounts tokenId={tokenId} addressHash={addressHash}>
      {isLoadingTokenBalances || isLoadingTokenPrice ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        worth !== undefined && (
          <Price>
            <Amount value={worth} isFiat />
          </Price>
        )
      )}
    </AddressTokenBalancesRowAmounts>
  )
}

const NSTAmounts = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => {
  const { t } = useTranslation()

  return (
    <AddressTokenBalancesRowAmounts tokenId={tokenId} addressHash={addressHash}>
      <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
    </AddressTokenBalancesRowAmounts>
  )
}

interface AddressTokenBalancesRowAmounts extends AddressTokenBalancesRowProps {
  children: ReactNode
}

const AddressTokenBalancesRowAmounts = ({ tokenId, addressHash, children }: AddressTokenBalancesRowAmounts) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { data: addressTokenBalances, isLoading: isLoadingTokenBalances } = useAddressTokenBalances(
    addressHash,
    tokenId
  )

  const totalBalance = addressTokenBalances?.balances.totalBalance
  const availableBalance = addressTokenBalances?.balances.availableBalance

  return (
    <TableCellAmount>
      {isLoadingTokenBalances ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <>
          {totalBalance && <TokenAmount tokenId={tokenId} value={totalBalance} />}

          {availableBalance !== totalBalance && availableBalance !== undefined && (
            <AmountSubtitle>
              {`${t('Available')}: `}
              <Amount tokenId={tokenId} value={availableBalance} color={theme.font.tertiary} />
            </AmountSubtitle>
          )}
        </>
      )}

      {children}
    </TableCellAmount>
  )
}

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenName = styled(Truncate)`
  display: flex;
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  gap: 5px;
  align-items: center;
  width: 200px;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  width: 200px;
`

const InfoIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 50%;
  cursor: default;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TokenAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
`

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const Price = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`
