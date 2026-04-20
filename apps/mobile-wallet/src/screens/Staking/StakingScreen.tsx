import { selectDefaultAddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import { openModal } from '~/features/modals/modalActions'
import useIsStakingEnabled from '~/features/staking/hooks/useIsStakingEnabled'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import DefaultAddressSection from '~/screens/Staking/DefaultAddressSection'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

import StakingCard from './StakingCard'
import UnstakingRequestsList from './UnstakingRequestsList'

const StakingScreen = () => {
  const { t } = useTranslation()
  const addressHash = useAppSelector(selectDefaultAddressHash)
  const dispatch = useAppDispatch()
  const isStakingEnabled = useIsStakingEnabled()
  const hasPendingStakeOrUnstake = useAppSelector((s) => !!s.staking.pendingStakeOrUnstake)
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const theme = useTheme()

  if (!isStakingEnabled || !addressHash) return null

  const handleStakePress = () => dispatch(openModal({ name: 'StakeModal', props: { addressHash } }))
  const handleUnstakePress = () => dispatch(openModal({ name: 'UnstakeModal', props: { addressHash } }))

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('Staking') }} scrollY={screenScrollY} />
      <StyledScrollView onScroll={screenScrollHandler} scrollEventThrottle={16}>
        <ScreenTitle title={t('Staking')} scrollY={screenScrollY} sideDefaultMargin paddingTop />

        <ContentContainer>
          <DefaultAddressSection />

          <StakingCard addressHash={addressHash} />

          <ButtonsRow>
            <Button
              title={t('Stake')}
              onPress={handleStakePress}
              disabled={hasPendingStakeOrUnstake}
              flex
              style={{ backgroundColor: theme.global.palette3 }}
            />
            <Button
              title={t('Unstake')}
              onPress={handleUnstakePress}
              disabled={hasPendingStakeOrUnstake}
              type="secondary"
              variant="default"
              flex
            />
          </ButtonsRow>

          <Divider />

          <UnstakingRequestsList addressHash={addressHash} />
        </ContentContainer>
      </StyledScrollView>
    </Screen>
  )
}

export default StakingScreen

const StyledScrollView = styled.ScrollView`
  flex: 1;
`

const ContentContainer = styled.View`
  padding: 0 ${DEFAULT_MARGIN}px;
  padding-bottom: 120px;
  gap: 20px;
`

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 10px;
`

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
