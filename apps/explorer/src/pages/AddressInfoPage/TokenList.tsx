import { ALPH } from '@alephium/token-list'
import { addressFromTokenId, Optional } from '@alephium/web3'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RiInformationFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/Table/TableCellAmount'
import { AssetBase, FungibleTokenMetadataBase, NumericTokenBalance } from '@/types/assets'

interface TokenListProps {
  tokens: Optional<
    AssetBase & FungibleTokenMetadataBase & NumericTokenBalance,
    'type' | 'decimals' | 'symbol' | 'name' | 'verified'
  >[]
  limit?: number
  isLoading?: boolean
  className?: string
}

const TokenList = ({ tokens, limit, isLoading, className }: TokenListProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()

  const displayedTokens = limit ? tokens.slice(0, limit) : tokens

  const handleTokenNameClick = (tokenId: string) => {
    try {
      const tokenAddress = addressFromTokenId(tokenId)
      navigate(`/addresses/${tokenAddress}`)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className={className}>
      {displayedTokens.map((token) => {
        const isAlph = token.id === ALPH.id

        return (
          <AssetRow key={token.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AssetLogoStyled assetId={token.id} size={30} />
            <NameColumn>
              <TokenNameAndTag>
                <TokenName onClick={() => !isAlph && handleTokenNameClick(token.id)} isAlph={isAlph}>
                  {token.name || <HashEllipsed hash={token.id} copyTooltipText={t('Copy token ID')} />}
                </TokenName>
                {!isAlph && !token.logoURI && token.name && (
                  <UnverifiedIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')} />
                )}
              </TokenNameAndTag>
              {token.name && !isAlph && (
                <TokenHash>
                  <HashEllipsed hash={token.id} copyTooltipText={t('Copy token ID')} />
                </TokenHash>
              )}
            </NameColumn>

            {!token.name && token.type && (
              <IncompleteMetadataBadge compact type="neutral" content={t('Wrong/old format')} />
            )}

            <TableCellAmount>
              <TokenAmount assetId={token.id} value={token.balance} suffix={token.symbol} decimals={token.decimals} />
              {token.worth && !isNaN(token.worth) && (
                <Amount value={token.worth} suffix="$" isFiat color={theme.font.secondary} />
              )}
              {token.lockedBalance > 0 ? (
                <TokenAmountSublabel>
                  {`${t('Available')} `}
                  <Amount
                    assetId={token.id}
                    value={token.balance - token.lockedBalance}
                    suffix={token.symbol}
                    color={theme.font.secondary}
                    decimals={token.decimals}
                  />
                </TokenAmountSublabel>
              ) : token.decimals === undefined ? (
                <TokenAmountSublabel>{t('Raw amount')}</TokenAmountSublabel>
              ) : undefined}
            </TableCellAmount>
          </AssetRow>
        )
      })}
      {isLoading && (
        <LoadingRow>
          <SkeletonLoader height="40px" width="280px" />
          <SkeletonLoader height="25px" width="200px" />
        </LoadingRow>
      )}
    </div>
  )
}

export default TokenList

const AssetRow = styled(motion.div)`
  display: flex;
  padding: 14px 20px;
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`

const TokenNameAndTag = styled.div`
  width: 100%;
  display: flex;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  max-width: 250px;
`

const TokenName = styled.span<{ isAlph: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ isAlph }) =>
    !isAlph &&
    css`
      &:hover {
        cursor: pointer;
        opacity: 0.8;
      }
    `}
`

const UnverifiedIcon = styled(RiInformationFill)`
  fill: ${({ theme }) => theme.font.tertiary};
  margin-top: 1px;
`

const TokenHash = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  max-width: 150px;
`

const TokenAmount = styled(Amount)`
  font-size: 14px;
`

const TokenAmountSublabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 400;
`

const NameColumn = styled(Column)`
  margin-right: 20px;
  overflow: hidden;
`

const LoadingRow = styled.div`
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const IncompleteMetadataBadge = styled(Badge)``
