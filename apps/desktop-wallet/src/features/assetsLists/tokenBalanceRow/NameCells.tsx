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
import styled from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT, isUnlistedFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import HashEllipsed from '@/components/HashEllipsed'
import { TableCell } from '@/components/Table'
import Truncate from '@/components/Truncate'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const FTNameCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <TableCell>
      <TokenName>
        {token.name}

        {isUnlistedFT(token) && (
          <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
            i
          </InfoIcon>
        )}
      </TokenName>

      <TokenPrice tokenSymbol={token.symbol} />
    </TableCell>
  )
}

const TokenPrice = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const { data: tokenPrice } = useFetchTokenPrice(tokenSymbol)

  return (
    <TokenPriceStyled>
      {tokenPrice !== undefined && <AmountStyled isFiat value={tokenPrice} overrideSuffixColor color="tertiary" />}
    </TokenPriceStyled>
  )
}

export const NSTNameCell = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()

  return (
    <TableCell>
      <TokenName>
        <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} />
      </TokenName>
    </TableCell>
  )
}

const TokenName = styled(Truncate)`
  display: flex;
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  gap: 5px;
  align-items: center;
`

const TokenPriceStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  width: 200px;
  display: flex;
  align-items: center;
  gap: 5px;
`

const AmountStyled = styled(Amount)`
  font-weight: var(--fontWeight-medium);
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
