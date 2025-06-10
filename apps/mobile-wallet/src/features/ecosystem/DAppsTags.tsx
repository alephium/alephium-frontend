import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import styled, { useTheme } from 'styled-components/native'

import { dAppsTagsQuery } from '~/api/queries/dAppQueries'
import Button from '~/components/buttons/Button'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface DAppsCategoriesProps {
  selectedTag: string | null
  onTagPress: (tag: string | null) => void
}

const DAppsTags = ({ selectedTag, onTagPress }: DAppsCategoriesProps) => {
  const { data: dAppTags } = useQuery(dAppsTagsQuery)
  const theme = useTheme()

  if (!dAppTags) return null

  return (
    <DAppsCategoriesStyled
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingRight: DEFAULT_MARGIN * 2 }}
    >
      <Button
        compact
        onPress={() => onTagPress(selectedTag === 'fav' ? null : 'fav')}
        variant={selectedTag === 'fav' ? 'contrast' : undefined}
        color={selectedTag === 'fav' ? undefined : theme.global.alert}
        iconProps={{ name: 'heart' }}
        style={{ backgroundColor: selectedTag === 'fav' ? theme.global.alert : theme.bg.primary }}
      />

      {dAppTags.map((tag) => (
        <Button
          title={tag}
          compact
          key={tag}
          onPress={() => onTagPress(selectedTag === tag ? null : tag)}
          variant={selectedTag === tag ? 'contrast' : undefined}
        />
      ))}

      <CustomDappButton />
    </DAppsCategoriesStyled>
  )
}

const CustomDappButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()
  const [dAppUrl, setDAppUrl] = useState('')

  const handleUrlChange = (url: string) => {
    setDAppUrl(url)
    openDappBrowser(url)
  }

  const openDappBrowser = (dAppUrl: string) => navigation.navigate('DAppWebViewScreen', { dAppUrl, dAppName: '' })

  const openEditUrlModal = () =>
    dispatch(openModal({ name: 'EditDappUrlModal', props: { url: dAppUrl, onUrlChange: handleUrlChange } }))

  return <Button compact onPress={openEditUrlModal} iconProps={{ name: 'add' }} />
}

export default DAppsTags

const DAppsCategoriesStyled = styled.ScrollView`
  padding: 0 ${DEFAULT_MARGIN}px;
  flex-grow: 0;
`
