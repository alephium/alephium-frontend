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
import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import SelectOptionTokenName from '@/components/Inputs/SelectOptionTokenName'
import Truncate from '@/components/Truncate'
import { TokenId } from '@/types/tokens'

export interface SelectOptionTokenBaseProps {
  tokenId: TokenId
  isSelected?: boolean
  className?: string
}

interface SelectOptionTokenProps extends SelectOptionTokenBaseProps {
  isLoading: boolean
  showAmount?: boolean
  amount?: bigint
  children?: ReactNode
}

const SelectOptionToken = ({
  tokenId,
  showAmount,
  isLoading,
  amount,
  isSelected,
  className
}: SelectOptionTokenProps) => (
  <SelectOptionItemContent
    MainContent={
      <>
        <AssetName>
          <AssetLogo tokenId={tokenId} size={20} />
          <Truncate>
            <SelectOptionTokenName tokenId={tokenId} />
          </Truncate>
        </AssetName>

        {showAmount && <AmountStyled tokenId={tokenId} value={amount} isLoading={isLoading} />}
      </>
    }
    isSelected={isSelected}
    className={className}
  />
)

export default SelectOptionToken

const AssetName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 200px;
`

const AmountStyled = styled(Amount)`
  flex: 1;
  font-weight: var(--fontWeight-semiBold);
  text-align: right;
  margin-left: auto;
  display: block;
`
