import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AnimatedBackground from '~/components/AnimatedBackground'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import DAppsList from '~/features/ecosystem/DAppsList'
import DAppsTags from '~/features/ecosystem/DAppsTags'

const showComingSoon = true

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
      {showComingSoon ? (
        <ScreenSection>
          <EmptyPlaceholder>
            <AppText size={32}>📣👀</AppText>
            <AppText>{t('Coming soon!')}</AppText>
          </EmptyPlaceholder>
        </ScreenSection>
      ) : (
        <>
          <AnimatedBackground isFullScreen isAnimated />
          <DAppsTags selectedTag={selectedTag} onTagPress={setSelectedTag} />
          <DAppsList selectedTag={selectedTag} />
        </>
      )}
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen
