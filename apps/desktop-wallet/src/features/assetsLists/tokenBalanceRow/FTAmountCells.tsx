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
import styled from 'styled-components'

import useFetchAddressSingleTokenBalances from '@/api/apiDataHooks/address/useFetchAddressSingleTokenBalances'
import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import FTAmounts from '@/components/amounts/FTAmounts'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableCell } from '@/components/Table'
import { TokenId } from '@/types/tokens'

interface FTAddressAmountCellProps {
  tokenId: TokenId
  addressHash: AddressHash
}

export const FTAddressAmountCell = ({ tokenId, addressHash }: FTAddressAmountCellProps) => {
  const { isLoading } = useFetchAddressSingleTokenBalances({ addressHash: addressHash, tokenId })

  return <FTAmountCell tokenId={tokenId} isLoading={isLoading} />
}

export const FTWalletAmountCell = ({ tokenId }: Omit<FTAddressAmountCellProps, 'addressHash'>) => {
  const { isLoading } = useFetchWalletSingleTokenBalances({ tokenId })

  return <FTAmountCell tokenId={tokenId} isLoading={isLoading} />
}

interface FTAmountCellProps {
  tokenId: TokenId
  isLoading: boolean
}

const FTAmountCell = ({ tokenId, isLoading }: FTAmountCellProps) => (
  <TableCell align="right">
    {isLoading ? (
      <SkeletonLoader height="20px" width="30%" />
    ) : (
      <AmountsContainer>
        <FTAmounts tokenId={tokenId} />
      </AmountsContainer>
    )}
  </TableCell>
)

export const RawAmountSubtitle = () => {
  const { t } = useTranslation()

  return <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
}

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const AmountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`
