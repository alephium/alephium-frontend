import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'

const EcosystemScreen = () => {
  const { t } = useTranslation()

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
    >
      <AnimatedBackground isFullScreen isAnimated />
      <DAppFilters></DAppFilters>
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

const DAppFilters = styled.View``
