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

import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenId } from '@/types/tokens'

interface FTAddressAmountCellProps {
  tokenId: TokenId
  addressHash: AddressHash
}

export const FTAddressAmountCell = ({ tokenId, addressHash }: FTAddressAmountCellProps) => {
  const { data: balances, isLoading } = useFetchAddressSingleTokenBalances({
    addressHash: addressHash,
    tokenId
  })

  return (
    <FTAmountCell
      tokenId={tokenId}
      totalBalance={BigInt(balances.totalBalance)}
      availableBalance={BigInt(balances.availableBalance)}
      isLoading={isLoading}
    />
  )
}

export const FTWalletAmountCell = ({ tokenId }: Omit<FTAddressAmountCellProps, 'addressHash'>) => {
  const { data: balances, isLoading } = useFetchWalletSingleTokenBalances({
    tokenId
  })

  return (
    <FTAmountCell
      tokenId={tokenId}
      totalBalance={BigInt(balances.totalBalance)}
      availableBalance={BigInt(balances.availableBalance)}
      isLoading={isLoading}
    />
  )
}

interface FTAmountCellProps {
  tokenId: TokenId
  totalBalance?: bigint
  availableBalance?: bigint
  isLoading: boolean
}

const FTAmountCell = ({ tokenId, isLoading, totalBalance, availableBalance }: FTAmountCellProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <TableCell align="right">
      {isLoading ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <>
          {totalBalance && <Amount tokenId={tokenId} value={totalBalance} semiBold />}

          {availableBalance !== totalBalance && availableBalance !== undefined && (
            <AmountSubtitle>
              {`${t('Available')}: `}
              <Amount tokenId={tokenId} value={availableBalance} color={theme.font.tertiary} overrideSuffixColor />
            </AmountSubtitle>
          )}
        </>
      )}
    </TableCell>
  )
}

export const RawAmountSubtitle = () => {
  const { t } = useTranslation()

  return <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
}

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`
