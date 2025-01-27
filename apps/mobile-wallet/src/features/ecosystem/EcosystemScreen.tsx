import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInputProps } from 'react-native'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import SearchInput from '~/components/SearchInput'
import DAppsList from '~/features/ecosystem/DAppsList'
import DAppsTags from '~/features/ecosystem/DAppsTags'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const showComingSoon = true

const EcosystemScreen = () => {
  const { t } = useTranslation()

  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
      fill
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
          <SearchBar value={searchText} onChangeText={setSearchText} />
          <DAppsTags selectedTag={selectedTag} onTagPress={setSelectedTag} />
          <DAppsList selectedTag={selectedTag} searchText={searchText} />
        </>
      )}
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

const SearchBar = (props: TextInputProps) => (
  <SearchBarStyled>
    <SearchInput {...props} />
  </SearchBarStyled>
)

const SearchBarStyled = styled(ScreenSection)`
  margin-bottom: ${DEFAULT_MARGIN}px;
`
