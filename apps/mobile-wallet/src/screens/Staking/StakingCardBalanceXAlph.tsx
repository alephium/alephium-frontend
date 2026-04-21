import { AddressHash, formatAmountForDisplay } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchXAlphBalance from '~/features/staking/hooks/useFetchXAlphBalance'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import AmountSkeleton from '~/screens/Staking/AmountSkeleton'

interface StakingCardBalanceXAlphProps {
  addressHash: AddressHash
}

const StakingCardBalanceXAlph = ({ addressHash }: StakingCardBalanceXAlphProps) => {
  const { t } = useTranslation()
  const { data: xAlphBalance, isLoading: isXAlphBalanceLoading } = useFetchXAlphBalance(addressHash)
  const { data: xAlphRate, isLoading: isXAlphRateLoading } = useFetchXAlphRate()

  const formattedXAlphBalance = formatAmountForDisplay({ amount: xAlphBalance, amountDecimals: ALPH.decimals })

  if (isXAlphBalanceLoading || isXAlphRateLoading) return <AmountSkeleton height={25} />

  return (
    <Badge>
      <BadgeText>
        {t('{{ xAlphAmount }} xALPH @ {{ xAlphRate }} ALPH', {
          xAlphAmount: formattedXAlphBalance,
          xAlphRate: xAlphRate.toFixed(4)
        })}
      </BadgeText>
    </Badge>
  )
}

export default StakingCardBalanceXAlph

const Badge = styled.View`
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px 10px;
  align-self: flex-start;
  margin-top: 2px;
`

const BadgeText = styled(AppText)`
  font-size: 12px;
  color: white;
  opacity: 0.85;
`
