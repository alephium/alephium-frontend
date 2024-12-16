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

import { colord } from 'colord'
import { memo } from 'react'
import styled, { css, useTheme } from 'styled-components'

import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TokenId } from '@/types/tokens'

export interface TokenBadgeStyleProps {
  withBorder?: boolean
  withBackground?: boolean
  className?: string
  showNftName?: boolean
  showAmount?: boolean
  displaySign?: boolean
}

interface TokenBadgeProps extends TokenBadgeStyleProps {
  tokenId: TokenId
  amount?: bigint
  isLoadingAmount?: boolean
}

const TokenBadge = memo(({ tokenId, className, displaySign, withBackground, amount, ...props }: TokenBadgeProps) => {
  const { data: token } = useFetchToken(tokenId)
  const theme = useTheme()

  const tooltipContent = isFT(token) || isNFT(token) ? token.name : tokenId

  return (
    <TokenBadgeStyled
      className={className}
      data-tooltip-id="default"
      data-tooltip-content={tooltipContent}
      withBackground={withBackground}
      color={displaySign ? (amount && amount > 0 ? theme.global.valid : theme.global.alert) : undefined}
      style={{
        backgroundColor: displaySign
          ? amount && amount > 0
            ? colord(theme.global.valid).alpha(0.05).toHex()
            : colord(theme.font.highlight).alpha(0.05).toHex()
          : theme.bg.highlight
      }}
    >
      <AssetLogo tokenId={tokenId} size={20} />

      {(props.showNftName || props.showAmount) && (
        <TokenBadgeText tokenId={tokenId} amount={amount} displaySign={displaySign} {...props} />
      )}
    </TokenBadgeStyled>
  )
})

const TokenBadgeText = ({
  tokenId,
  amount,
  isLoadingAmount,
  showNftName,
  showAmount,
  displaySign
}: TokenBadgeProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)

  if (isLoadingToken) return <SkeletonLoader height="20px" />

  if (isNFT(token) && showNftName) return <TokenSymbol>{token.name}</TokenSymbol>

  if (!isNFT(token) && showAmount)
    return (
      <Amount
        tokenId={tokenId}
        value={amount}
        useTinyAmountShorthand
        isLoading={isLoadingAmount}
        showPlusMinus={displaySign}
        highlight={displaySign}
        semiBold
      />
    )

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
      border-radius: var(--radius-huge);
      padding: 4px 10px 4px 4px;
    `}
`

const TokenSymbol = styled.div`
  font-weight: var(--fontWeight-semiBold);
`
