import { calculateTokenAmountWorth, selectPriceById } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import { useAppSelector } from '~/hooks/redux'

interface FeeAmountsProps {
  fees: bigint
}

const FeeAmounts = ({ fees }: FeeAmountsProps) => (
  <FeeAmountsStyled>
    <Amount value={fees} suffix="ALPH" medium />
    <FeeWorth fees={fees} />
  </FeeAmountsStyled>
)

export default FeeAmounts

const FeeWorth = ({ fees }: FeeAmountsProps) => {
  const alphPrice = useAppSelector((s) => selectPriceById(s, ALPH.symbol)?.price)
  const { t } = useTranslation()

  const feesWorth = calculateTokenAmountWorth(fees, alphPrice ?? 0, ALPH.decimals)
  const isTooSmall = feesWorth < 0.01
  const displayedFeesWorth = isTooSmall ? 0.01 : feesWorth

  return (
    <Amount value={displayedFeesWorth} isFiat fiatPrefix={isTooSmall ? t('less than') : undefined} color="secondary" />
  )
}

const FeeAmountsStyled = styled.View`
  gap: 5px;
  align-items: flex-end;
`
