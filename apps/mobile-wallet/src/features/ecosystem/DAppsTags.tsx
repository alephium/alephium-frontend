import { useQuery } from '@tanstack/react-query'
import styled, { useTheme } from 'styled-components/native'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import Button from '~/components/buttons/Button'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { selectFavoriteDApps } from '~/features/ecosystem/favoriteDAppsSelectors'
import { useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface DAppsCategoriesProps {
  selectedTag: string | null
  onTagPress: (tag: string | null) => void
}

const DAppsTags = ({ selectedTag, onTagPress }: DAppsCategoriesProps) => {
  const hasFavoriteDApps = useAppSelector((s) => selectFavoriteDApps(s).length > 0)
  const { data: dAppTags } = useQuery(dAppsQuery({ select: extractDAppTags }))
  const theme = useTheme()

  if (!dAppTags) return null

  return (
    <DAppsCategoriesStyled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {hasFavoriteDApps && (
        <Button
          compact
          onPress={() => onTagPress(selectedTag === 'fav' ? null : 'fav')}
          variant={selectedTag === 'fav' ? 'highlight' : undefined}
          color={selectedTag === 'fav' ? undefined : theme.font.highlight}
          iconProps={{ name: 'star' }}
        />
      )}
      {dAppTags.map((tag) => (
        <Button
          title={tag}
          compact
          key={tag}
          onPress={() => onTagPress(selectedTag === tag ? null : tag)}
          variant={selectedTag === tag ? 'highlight' : undefined}
        />
      ))}
    </DAppsCategoriesStyled>
  )
}

export default DAppsTags

const DAppsCategoriesStyled = styled.ScrollView`
  padding: 0 ${DEFAULT_MARGIN}px;
`

const extractDAppTags = (dApps: DApp[]) =>
  dApps
    .reduce((acc, dApp) => {
      dApp.tags.forEach((tag) => !acc.includes(tag) && acc.push(tag))
      return acc
    }, [] as string[])
    .sort()
