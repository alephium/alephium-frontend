import { useFetchFeeWorth } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'

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
  const { t } = useTranslation()

  const { data: feesWorth } = useFetchFeeWorth(fees)

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
