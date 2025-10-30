import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInputProps } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import SearchInput from '~/components/SearchInput'
import DAppsList from '~/features/ecosystem/DAppsList'
import DAppsTags from '~/features/ecosystem/DAppsTags'
import { getValidUrl } from '~/features/ecosystem/ecosystemUtils'
import { selectFavoriteDApps } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const EcosystemScreen = () => {
  const { t } = useTranslation()
  const hasFavoriteDApps = useAppSelector((s) => selectFavoriteDApps(s).length > 0)
  const authorizedConnectionsCount = useAppSelector((s) => s.authorizedConnections.ids.length)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const [selectedTag, setSelectedTag] = useState<string | null>(hasFavoriteDApps ? 'fav' : null)
  const [searchText, setSearchText] = useState('')

  const handleSearchSubmit = () => {
    const urlToLoad = getValidUrl(searchText)

    if (urlToLoad) {
      navigation.navigate('DAppWebViewScreen', { dAppUrl: urlToLoad, dAppName: '' })
    }
  }

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{
        headerTitle: t('Ecosystem'),
        headerRight: authorizedConnectionsCount > 0 ? () => <AuthorizedConnectionsButton /> : undefined
      }}
      contentPaddingTop
      hasBottomBar
      hasKeyboard
      fill
    >
      <SearchBar value={searchText} onChangeText={setSearchText} onSubmitEditing={handleSearchSubmit} />
      <DAppsTags selectedTag={selectedTag} onTagPress={setSelectedTag} />
      <DAppsList selectedTag={selectedTag} searchText={searchText} />
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

const AuthorizedConnectionsButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const authorizedConnectionsCount = useAppSelector((s) => s.authorizedConnections.ids.length)

  const handleButtonPress = () => {
    navigation.navigate('AuthorizedConnectionsScreen')
  }

  if (authorizedConnectionsCount === 0) return null

  return (
    <Button iconProps={{ name: 'radio-outline' }} onPress={handleButtonPress} compact>
      <AppText size={12}>{authorizedConnectionsCount}</AppText>
    </Button>
  )
}

const SearchBar = (props: TextInputProps) => (
  <SearchBarStyled>
    <SearchInput {...props} />
  </SearchBarStyled>
)

const SearchBarStyled = styled(ScreenSection)`
  margin-bottom: ${DEFAULT_MARGIN}px;
`
