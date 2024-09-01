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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useAddressesDisplayTokens, { getTokenDisplayData } from '@/api/useAddressesDisplayTokens'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import Truncate from '@/components/Truncate'
import { AssetsTabsProps } from '@/features/assetsLists/types'
import { useAppSelector } from '@/hooks/redux'

interface TokenBalancesRowProps {
  tokenId: string
  isExpanded: AssetsTabsProps['isExpanded']
  addressHash?: AddressHash
}

const TokenBalancesRow = ({ tokenId, addressHash, isExpanded }: TokenBalancesRowProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { data: tokens, isLoadingFTs } = useAddressesDisplayTokens(addressHash)
  const token = tokens.find((token) => token.id === tokenId)

  if (!token) return null

  const { image, name, symbol, totalBalance, availableBalance, decimals, worth } = getTokenDisplayData(token)

  return (
    <TableRow key={tokenId} role="row" tabIndex={isExpanded ? 0 : -1}>
      <TokenRow>
        <AssetLogoStyled assetImageUrl={image} size={30} assetName={name} />
        <NameColumn>
          <TokenName>
            {name ?? <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} disableCopy={!isExpanded} />}
            {token.type === 'unlistedFT' && (
              <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
                i
              </InfoIcon>
            )}
          </TokenName>
          {symbol && <TokenSymbol>{symbol}</TokenSymbol>}
        </NameColumn>
        <TableCellAmount>
          {isLoadingFTs ? (
            <SkeletonLoader height="20px" width="30%" />
          ) : (
            <>
              <TokenAmount
                value={totalBalance}
                suffix={symbol}
                decimals={decimals}
                isNonStandardToken={token.type === 'nonStandardToken'}
              />
              {availableBalance !== totalBalance && (
                <AmountSubtitle>
                  {`${t('Available')}: `}
                  <Amount
                    value={availableBalance}
                    suffix={symbol}
                    color={theme.font.tertiary}
                    decimals={decimals}
                    isNonStandardToken={token.type === 'nonStandardToken'}
                  />
                </AmountSubtitle>
              )}
              {token.type === 'nonStandardToken' && <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>}
              {worth !== undefined && (
                <Price>
                  <Amount value={worth} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
                </Price>
              )}
            </>
          )}
        </TableCellAmount>
      </TokenRow>
    </TableRow>
  )
}

export default TokenBalancesRow

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