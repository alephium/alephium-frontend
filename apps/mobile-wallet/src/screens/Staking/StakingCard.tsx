import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import StakingCardBalanceAlph from '~/screens/Staking/StakingCardBalanceAlph'
import StakingCardBalanceXAlph from '~/screens/Staking/StakingCardBalanceXAlph'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

interface StakingCardProps {
  addressHash: AddressHash
}

const StakingCard = ({ addressHash }: StakingCardProps) => {
  const { t } = useTranslation()

  return (
    <CardContainer>
      <LabeledDataContainer>
        <Label>{t('Staked')}</Label>
        <StakingCardBalanceAlph addressHash={addressHash} />
        <StakingCardBalanceXAlph addressHash={addressHash} />
      </LabeledDataContainer>

      <Divider />

      <LabeledDataContainer>
        <Label>{t('APR')}</Label>
        <AvailableValue>-</AvailableValue>
      </LabeledDataContainer>
    </CardContainer>
  )
}

export default StakingCard

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

const AvailableValue = styled(AppText)`
  font-size: 20px;
  font-weight: 600;
  color: white;
`

const Divider = styled.View`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
`
