import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AnimatedBackground from '~/components/AnimatedBackground'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import DAppsList from '~/features/ecosystem/DAppsList'
import DAppsTags from '~/features/ecosystem/DAppsTags'

const EcosystemScreen = () => {
  const { t } = useTranslation()

  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
    >
      <AnimatedBackground isFullScreen isAnimated />
      <DAppsTags selectedTag={selectedTag} onTagPress={setSelectedTag} />
      <DAppsList selectedTag={selectedTag} />
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen
