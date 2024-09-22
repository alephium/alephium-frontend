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

import styled, { css } from 'styled-components'

import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/useFetchToken'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TokenId } from '@/types/tokens'

export interface TokenBadgeStyleProps {
  withBorder?: boolean
  withBackground?: boolean
  className?: string
  showSymbol?: boolean
  showNftName?: boolean
  showAmount?: boolean
}

interface TokenBadgeProps extends TokenBadgeStyleProps {
  tokenId: TokenId
  amount?: bigint
  isLoading?: boolean
}

const TokenBadge = ({ tokenId, className, ...props }: TokenBadgeProps) => {
  const { data: token } = useFetchToken(tokenId)

  const tooltipContent = isFT(token) || isNFT(token) ? token.name : tokenId

  return (
    <TokenBadgeStyled className={className} data-tooltip-id="default" data-tooltip-content={tooltipContent}>
      <AssetLogo tokenId={tokenId} size={20} />

      <TokenBadgeText tokenId={tokenId} {...props} />
    </TokenBadgeStyled>
  )
}

const TokenBadgeText = ({ tokenId, amount, isLoading, showNftName, showAmount, showSymbol }: TokenBadgeProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (isNFT(token) && showNftName) return <TokenSymbol>{token.name}</TokenSymbol>

  if (isFT(token) && isLoading) return <SkeletonLoader height="20px" />

  if (isFT(token) && showAmount && amount !== undefined)
    return <Amount tokenId={tokenId} value={amount} useTinyAmountShorthand />

  if (isFT(token) && showSymbol) return <TokenSymbol>{token.symbol}</TokenSymbol>

  return null
}

export default TokenBadge

const TokenBadgeStyled = styled.div<Pick<TokenBadgeProps, 'withBackground' | 'withBorder'>>`
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

const TokenSymbol = styled.div`
  font-weight: var(--fontWeight-semiBold);
`