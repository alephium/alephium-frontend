import { isFT, isListedFT, Token } from '@alephium/shared'
import { getAddressExplorerPagePath } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { addressFromTokenId } from '@alephium/web3'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { RiInformationFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import AssetLogo from '@/components/AssetLogo'
import HashEllipsed from '@/components/HashEllipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import AddressTokenBalances from '@/pages/AddressPage/AddressTokenBalances'

interface TokenListProps {
  tokens: Token[]
  addressStr: string
  isLoading?: boolean
  className?: string
}

const TokenList = ({ tokens, addressStr, isLoading, className }: TokenListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleTokenNameClick = (tokenId: string) => {
    try {
      const tokenAddress = addressFromTokenId(tokenId)
      navigate(getAddressExplorerPagePath(tokenAddress))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className={className}>
      {tokens.map((token) => {
        const isAlph = token.id === ALPH.id

        const tokenName = isFT(token) ? token.name : token.id
        const tokenLogoURI = isListedFT(token) ? token.logoURI : undefined

        return (
          <AssetRow key={token.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AssetLogoStyled assetId={token.id} size={28} />
            <NameColumn>
              <TokenNameAndTag>
                <TokenName onClick={() => !isAlph && handleTokenNameClick(token.id)} isAlph={isAlph}>
                  {tokenName || <HashEllipsed hash={token.id} copyTooltipText={t('Copy token ID')} />}
                </TokenName>
                {!isAlph && !tokenLogoURI && tokenName && (
                  <UnverifiedIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')} />
                )}
              </TokenNameAndTag>
              {tokenName && !isAlph && (
                <TokenHash>
                  <HashEllipsed hash={token.id} copyTooltipText={t('Copy token ID')} />
                </TokenHash>
              )}
            </NameColumn>

            <AddressTokenBalances tokenId={token.id} addressStr={addressStr} />
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
  padding: 10px 18px;
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
