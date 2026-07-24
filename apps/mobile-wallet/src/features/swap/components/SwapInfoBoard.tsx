import { formatAmountForDisplay } from '@alephium/shared/numbers'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { SwapQuote } from '~/features/swap/swapTypes'
import { BORDER_RADIUS, DEFAULT_MARGIN } from '~/style/globalStyle'

interface SwapInfoBoardProps {
  quote: SwapQuote
}

const formatRate = (rate: number) => {
  if (!Number.isFinite(rate) || rate <= 0) return '0'

  return rate >= 1 ? rate.toFixed(4).replace(/\.?0+$/, '') : rate.toPrecision(4)
}

const SwapInfoBoard = ({ quote }: SwapInfoBoardProps) => {
  const { t } = useTranslation()

  const inputAmount = BigInt(quote.inputAmount)
  const outputAmount = BigInt(quote.outputAmount)
  const { decimals: inDecimals, symbol: inSymbol } = quote.inputToken
  const { decimals: outDecimals, symbol: outSymbol } = quote.outputToken

  const rate =
    inputAmount === 0n ? 0 : Number(outputAmount) / 10 ** outDecimals / (Number(inputAmount) / 10 ** inDecimals)

  const priceImpact = quote.priceImpactPct
  const priceImpactColor = priceImpact >= 5 ? 'alert' : priceImpact >= 1 ? 'warning' : 'secondary'

  const isSell = quote.swapType === 'sell'
  const thresholdAmount = formatAmountForDisplay({
    amount: BigInt(quote.otherAmountThreshold),
    amountDecimals: isSell ? outDecimals : inDecimals
  })

  return (
    <Board>
      <InfoRow>
        <AppText color="secondary" size={13}>
          {t('Rate')}
        </AppText>
        <AppText size={13}>{`1 ${inSymbol} = ${formatRate(rate)} ${outSymbol}`}</AppText>
      </InfoRow>
      <InfoRow>
        <AppText color="secondary" size={13}>
          {t('Price impact')}
        </AppText>
        <AppText size={13} color={priceImpactColor}>{`${priceImpact.toFixed(2)}%`}</AppText>
      </InfoRow>
      <InfoRow>
        <AppText color="secondary" size={13}>
          {isSell ? t('Minimum received') : t('Maximum sold')}
        </AppText>
        <AppText size={13}>{`${thresholdAmount} ${isSell ? outSymbol : inSymbol}`}</AppText>
      </InfoRow>
    </Board>
  )
}

export default SwapInfoBoard

const Board = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: ${BORDER_RADIUS}px;
  padding: ${DEFAULT_MARGIN}px;
  gap: 10px;
`

const InfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
