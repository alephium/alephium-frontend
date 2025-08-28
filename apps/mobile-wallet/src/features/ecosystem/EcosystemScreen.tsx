import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInputProps } from 'react-native'
import styled from 'styled-components/native'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import SearchInput from '~/components/SearchInput'
import DAppsList from '~/features/ecosystem/DAppsList'
import DAppsTags from '~/features/ecosystem/DAppsTags'
import { selectFavoriteDApps } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const EcosystemScreen = () => {
  const { t } = useTranslation()
  const hasFavoriteDApps = useAppSelector((s) => selectFavoriteDApps(s).length > 0)

  const [selectedTag, setSelectedTag] = useState<string | null>(hasFavoriteDApps ? 'fav' : null)
  const [searchText, setSearchText] = useState('')

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
      hasKeyboard
      fill
    >
      <SearchBar value={searchText} onChangeText={setSearchText} />
      <DAppsTags selectedTag={selectedTag} onTagPress={setSelectedTag} />
      <DAppsList selectedTag={selectedTag} searchText={searchText} />
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

const SearchBar = (props: TextInputProps) => {
  const { data: dApps } = useQuery(dAppsQuery({ select: (dApps) => dApps }))

  if (!dApps || dApps.length < 5) return null

  return (
    <SearchBarStyled>
      <SearchInput {...props} />
    </SearchBarStyled>
  )
}

const SearchBarStyled = styled(ScreenSection)`
  margin-bottom: ${DEFAULT_MARGIN}px;
`
