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

import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/TableCellAmount'
import { TokenId } from '@/types/tokens'

interface AmountsColumnProps {
  isLoading: boolean
  tokenId: TokenId
  children: ReactNode
  totalBalance?: bigint
  availableBalance?: bigint
}

const AmountsColumn = ({ isLoading, totalBalance, availableBalance, children, tokenId }: AmountsColumnProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <TableCellAmount>
      {isLoading ? (
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

export const RawAmountSubtitle = () => {
  const { t } = useTranslation()

  return <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
}

export default AmountsColumn

const TokenAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
`

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`
