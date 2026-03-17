import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import { openModal } from '~/features/modals/modalActions'
import useIsStakingEnabled from '~/features/staking/hooks/useIsStakingEnabled'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

import StakingCard from './StakingCard'
import UnstakingRequestsList from './UnstakingRequestsList'

const StakingScreen = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isStakingEnabled = useIsStakingEnabled()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const theme = useTheme()

  if (!isStakingEnabled) return null

  const handleStakePress = () => {
    dispatch(openModal({ name: 'StakeModal' }))
  }

  const handleUnstakePress = () => {
    dispatch(openModal({ name: 'UnstakeModal' }))
  }

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('Staking') as string }} scrollY={screenScrollY} />
      <StyledScrollView onScroll={screenScrollHandler} scrollEventThrottle={16}>
        <ScreenTitle title={t('Staking') as string} scrollY={screenScrollY} sideDefaultMargin paddingTop />

        <ContentContainer>
          <StakingCard />

          <ButtonsRow>
            <Button
              title={t('Stake') as string}
              onPress={handleStakePress}
              flex
              style={{ backgroundColor: theme.global.palette3 }}
            />
            <Button
              title={t('Unstake') as string}
              onPress={handleUnstakePress}
              type="secondary"
              variant="default"
              flex
            />
          </ButtonsRow>

          <Divider />

          <UnstakingRequestsList />
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
