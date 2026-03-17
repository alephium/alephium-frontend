import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import useStakingData from '~/features/staking/hooks/useStakingData'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

const StakingCard = () => {
  const { t } = useTranslation()
  const { formattedStakedValue, formattedXAlphBalance, formattedXAlphRate, formattedAvailableToStake, isLoading } =
    useStakingData()

  return (
    <CardContainer>
      <LabeledDataContainer>
        <Label>{t('Staked')}</Label>
        <Value>{isLoading ? '...' : `${formattedStakedValue} ${ALPH.symbol}`}</Value>
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

const CardContainer = styled.View`
  background-color: ${({ theme }) => theme.global.accent};
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
