import { AssetAmount, calculateAmountWorth } from '@alephium/shared'
import { useFetchTokenPrices, useFetchTokensSeparatedByType } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { isNumber } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Box, { BoxProps } from '@/components/Box'
import InfoRow from '@/features/send/InfoRow'

interface CheckWorthBoxProps extends BoxProps {
  assetAmounts: AssetAmount[]
  fee: bigint
}

const CheckWorthBox = ({ assetAmounts, fee, ...props }: CheckWorthBoxProps) => {
  const { t } = useTranslation()

  const {
    data: { listedFts },
    isLoading: isLoadingTokensByType
  } = useFetchTokensSeparatedByType(assetAmounts)

  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const totalWorth = listedFts.reduce((totalWorth, token) => {
    const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
    const tokenAmount = assetAmounts.find((asset) => asset.id === token.id)?.amount
    const tokenWorth =
      isNumber(tokenPrice) && tokenAmount !== undefined
        ? calculateAmountWorth(tokenAmount, tokenPrice, token.decimals)
        : 0

    return totalWorth + tokenWorth
  }, 0)

  const alphPrice = tokenPrices?.find(({ symbol }) => symbol === ALPH.symbol)?.price
  const feeWorth = alphPrice ? calculateAmountWorth(fee, alphPrice, ALPH.decimals) : 0
  const tooSmallFee = feeWorth < 0.01

  return (
    <Box {...props}>
      <InfoRowStyled label={t('Total worth')}>
        <Amounts>
          <AmountStyled
            tokenId={ALPH.id}
            value={totalWorth}
            isFiat
            isLoading={isLoadingTokensByType || isLoadingTokenPrices}
          />
          <FeeRow>
            <FeeLabel>{t('Fee')}</FeeLabel>
            {tooSmallFee && ' < '}
            <AmountFee value={tooSmallFee ? 0.01 : feeWorth} isFiat isLoading={isLoadingTokenPrices} />
          </FeeRow>
        </Amounts>
      </InfoRowStyled>
    </Box>
  )
}

export default CheckWorthBox

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 20px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
`

const AmountFee = styled(Amount)``

const FeeRow = styled.div`
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 11px;
`

const FeeLabel = styled.span``

const InfoRowStyled = styled(InfoRow)`
  align-items: center;
`
