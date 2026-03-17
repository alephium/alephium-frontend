import { usePendingTxPolling } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useFetchAvailableToStake from '~/features/staking/hooks/useFetchAvailableToStake'
import useFetchXAlphBalance from '~/features/staking/hooks/useFetchXAlphBalance'
import useFetchXAlphRate from '~/features/staking/hooks/useFetchXAlphRate'
import usePendingStakingTransaction from '~/features/staking/hooks/usePendingStakingTransaction'
import useStakedValue from '~/features/staking/hooks/useStakedValue'
import { formatTokenAmount } from '~/features/staking/stakingUtils'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

const StakingCard = () => {
  const { t } = useTranslation()
  const { data: stakedValueAlph, isLoading: isStakedValueLoading } = useStakedValue()
  const { data: xAlphBalance, isLoading: isXAlphBalanceLoading } = useFetchXAlphBalance()
  const { data: xAlphRate, isLoading: isXAlphRateLoading } = useFetchXAlphRate()
  const { data: availableToStake, isLoading: isAvailableToStakeLoading } = useFetchAvailableToStake()
  const pendingStakingTransaction = usePendingStakingTransaction()

  const formattedStakedValue = formatTokenAmount(stakedValueAlph, ALPH.decimals)
  const formattedXAlphBalance = formatTokenAmount(xAlphBalance, ALPH.decimals)
  const formattedXAlphRate = xAlphRate.toFixed(4)
  const formattedAvailableToStake = formatTokenAmount(availableToStake, ALPH.decimals)
  const isLoading = isStakedValueLoading || isXAlphBalanceLoading || isXAlphRateLoading || isAvailableToStakeLoading

  return (
    <CardContainer>
      {pendingStakingTransaction && <PendingStakingTransactionPoller txHash={pendingStakingTransaction.hash} />}
      <LabeledDataContainer>
        <Label>{t('Staked')}</Label>
        <ValueRow>
          <Value>{isLoading ? '...' : `${formattedStakedValue} ${ALPH.symbol}`}</Value>
          {pendingStakingTransaction && <ActivityIndicator color="white" size="small" />}
        </ValueRow>
        <Badge>
          <BadgeText>
            {formattedXAlphBalance} xALPH @ {formattedXAlphRate} ALPH
          </BadgeText>
        </Badge>
      </LabeledDataContainer>

      <Divider />

      <LabeledDataContainer>
        <Label>{t('Available to stake')}</Label>
        <AvailableValue>{isLoading ? '...' : `${formattedAvailableToStake} ${ALPH.symbol}`}</AvailableValue>
      </LabeledDataContainer>
    </CardContainer>
  )
}

export default StakingCard

const PendingStakingTransactionPoller = ({ txHash }: { txHash: string }) => {
  usePendingTxPolling(txHash)

  return null
}

const CardContainer = styled.View`
  background-color: ${({ theme }) => theme.global.palette3};
  border-radius: ${BORDER_RADIUS_BIG}px;
  padding: ${DEFAULT_MARGIN}px;
  gap: 16px;
`

const LabeledDataContainer = styled.View`
  gap: 4px;
`

const Label = styled(AppText)`
  font-size: 13px;
  opacity: 0.7;
  color: white;
`

const Value = styled(AppText)`
  font-size: 28px;
  font-weight: 700;
  color: white;
`

const ValueRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const AvailableValue = styled(AppText)`
  font-size: 20px;
  font-weight: 600;
  color: white;
`

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

const Divider = styled.View`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
`
