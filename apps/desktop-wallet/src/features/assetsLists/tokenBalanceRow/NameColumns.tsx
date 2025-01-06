import { isNumber } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchToken, { isFT, isUnlistedFT } from '@/api/apiDataHooks/token/useFetchToken'
import Amount from '@/components/Amount'
import HashEllipsed from '@/components/HashEllipsed'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const FTNameColumn = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <NameColumn>
      <TokenName>
        {token.name}

        {isUnlistedFT(token) && (
          <InfoIcon data-tooltip-id="default" data-tooltip-content={t('No metadata')}>
            i
          </InfoIcon>
        )}
      </TokenName>

      <TokenSymbolAndPrice tokenSymbol={token.symbol} />
    </NameColumn>
  )
}

const TokenSymbolAndPrice = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const { data: tokenPrice } = useFetchTokenPrice(tokenSymbol)

  return (
    <TokenSymbolAndPriceStyled>
      {isNumber(tokenPrice) ? (
        <>
          {tokenSymbol}
          <PriceSeparator> • </PriceSeparator>
          <AmountStyled isFiat value={tokenPrice} overrideSuffixColor color="tertiary" />
        </>
      ) : (
        tokenSymbol
      )}
    </TokenSymbolAndPriceStyled>
  )
}

export const NSTNameColumn = ({ tokenId }: TokenBalancesRowBaseProps) => {
  const { t } = useTranslation()

  return (
    <NameColumn>
      <TokenName>
        <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} />
      </TokenName>
    </NameColumn>
  )
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`

const TokenName = styled.div`
  display: flex;
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  gap: 5px;
  align-items: center;
`

const TokenSymbolAndPriceStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  width: 200px;
  display: flex;
  align-items: center;
  gap: 5px;
`

const AmountStyled = styled(Amount)`
  font-weight: var(--fontWeight-medium);
`

const PriceSeparator = styled.span`
  font-size: 9px;
`

const InfoIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 14px;
  width: 14px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 50%;
  cursor: default;
`
