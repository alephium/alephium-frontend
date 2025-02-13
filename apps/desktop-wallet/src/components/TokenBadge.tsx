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
            ? colord(theme.global.valid).alpha(0.02).toHex()
            : colord(theme.font.highlight).alpha(0.02).toHex()
          : colord(theme.bg.highlight).alpha(0.02).toHex()
      }}
    >
      {(props.showNftName || props.showAmount) && (
        <TokenBadgeText tokenId={tokenId} amount={amount} displaySign={displaySign} {...props} />
      )}
      <AssetLogo tokenId={tokenId} size={14} />
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
