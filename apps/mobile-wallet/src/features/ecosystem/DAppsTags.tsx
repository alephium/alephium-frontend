import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components/native'

import { dAppQueries } from '~/api/queries/dAppQueries'
import Button from '~/components/buttons/Button'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface DAppsCategoriesProps {
  selectedTag: string | null
  onTagPress: (tag: string | null) => void
}

const DAppsTags = ({ selectedTag, onTagPress }: DAppsCategoriesProps) => {
  const { data: dAppTags } = useQuery(dAppQueries({ select: extractDAppTags }))

  if (!dAppTags) return null

  return (
    <DAppsCategoriesStyled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
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
