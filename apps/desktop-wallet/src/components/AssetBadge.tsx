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

import { Asset } from '@alephium/shared'
import styled, { css } from 'styled-components'

import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/useFetchToken'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'

export interface AssetBadgeStyleProps {
  simple?: boolean
  withBorder?: boolean
  withBackground?: boolean
  hideNftName?: boolean
  className?: string
}

interface AssetBadgeProps extends AssetBadgeStyleProps {
  assetId: Asset['id']
  amount?: bigint
}

const AssetBadge = ({ assetId, amount, simple, hideNftName, className }: AssetBadgeProps) => {
  const { data: token } = useFetchToken(assetId)

  const tooltipContent = isFT(token) || isNFT(token) ? token.name : assetId

  return (
    <div className={className} data-tooltip-id="default" data-tooltip-content={tooltipContent}>
      <AssetLogo tokenId={assetId} size={20} />
      {isNFT(token) && !hideNftName ? (
        <AssetSymbol>{token.name}</AssetSymbol>
      ) : isFT(token) && amount !== undefined ? (
        <Amount tokenId={assetId} value={amount} />
      ) : (
        !simple && isFT(token) && <AssetSymbol>{token.symbol}</AssetSymbol>
      )}
    </div>
  )
}

export default styled(AssetBadge)`
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ withBorder }) =>
    withBorder &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: var(--radius-huge);
      padding: 4px 10px 4px 4px;
    `}

  ${({ withBackground }) =>
    withBackground &&
    css`
      background-color: ${({ theme }) => theme.bg.highlight};
      border-radius: var(--radius-huge);
      padding: 4px 10px 4px 4px;
    `}
`

const AssetSymbol = styled.div`
  font-weight: var(--fontWeight-semiBold);
`
