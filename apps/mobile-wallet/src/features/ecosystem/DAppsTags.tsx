import { useQuery } from '@tanstack/react-query'
import styled, { useTheme } from 'styled-components/native'

import { dAppsTagsQuery } from '~/api/queries/dAppQueries'
import Button from '~/components/buttons/Button'
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
    <DAppsCategoriesStyled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      <Button
        compact
        onPress={() => onTagPress(selectedTag === 'fav' ? null : 'fav')}
        variant={selectedTag === 'fav' ? 'contrast' : undefined}
        color={selectedTag === 'fav' ? undefined : theme.font.highlight}
        iconProps={{ name: 'star' }}
        style={{ backgroundColor: selectedTag === 'fav' ? theme.font.highlight : theme.bg.primary }}
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
    </DAppsCategoriesStyled>
  )
}

export default DAppsTags

const DAppsCategoriesStyled = styled.ScrollView`
  padding: 0 ${DEFAULT_MARGIN}px;
  flex-grow: 0;
`
