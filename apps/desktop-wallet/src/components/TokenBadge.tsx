import { memo } from 'react'
import styled, { css } from 'styled-components'

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
}

interface TokenBadgeProps extends TokenBadgeStyleProps {
  tokenId: TokenId
  amount?: bigint
  isLoadingAmount?: boolean
}

const TokenBadge = memo(({ tokenId, className, ...props }: TokenBadgeProps) => {
  const { data: token } = useFetchToken(tokenId)

  const tooltipContent = isFT(token) || isNFT(token) ? token.name : tokenId

  return (
    <TokenBadgeStyled className={className} data-tooltip-id="default" data-tooltip-content={tooltipContent}>
      <AssetLogo tokenId={tokenId} size={20} />

      {(props.showNftName || props.showAmount) && <TokenBadgeText tokenId={tokenId} {...props} />}
    </TokenBadgeStyled>
  )
})

const TokenBadgeText = ({ tokenId, amount, isLoadingAmount, showNftName, showAmount }: TokenBadgeProps) => {
  const { data: token, isLoading: isLoadingToken } = useFetchToken(tokenId)

  if (isLoadingToken) return <SkeletonLoader height="20px" />

  if (isNFT(token) && showNftName) return <TokenSymbol>{token.name}</TokenSymbol>

  if (!isNFT(token) && showAmount)
    return <Amount tokenId={tokenId} value={amount} useTinyAmountShorthand isLoading={isLoadingAmount} />

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
