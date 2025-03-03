import { getHumanReadableError } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSection } from '~/components/layout/Screen'
import DAppCard from '~/features/ecosystem/DAppCard'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { selectFavoriteDApps } from '~/features/ecosystem/favoriteDAppsSelectors'
import { useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface DAppsListProps {
  selectedTag: string | null
  searchText: string
}

const DAppsList = ({ selectedTag, searchText }: DAppsListProps) => {
  const { t } = useTranslation()
  const favoriteDApps = useAppSelector(selectFavoriteDApps)

  const { data: dApps, isLoading, isError, error } = useQuery(dAppsQuery({ select: filterDAppsByTag(selectedTag) }))

  const tagFilteredDApps = selectedTag === 'fav' ? favoriteDApps : dApps

  const filteredDApps = useMemo(
    () => (tagFilteredDApps ? filterDAppsByText(searchText, tagFilteredDApps) : undefined),
    [searchText, tagFilteredDApps]
  )

  if (isLoading)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>⏳</AppText>
          <AppText>{t('Loading dApps...')}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  if (isError || !filteredDApps)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>🥺</AppText>
          <AppText>{t('Could not load dApps')}</AppText>
          <AppText>{getHumanReadableError(error, '')}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  if (selectedTag === 'fav' && tagFilteredDApps && !tagFilteredDApps.length)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>⭐️</AppText>
          <AppText>{t('No dApps added to your favorites yet')}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  if (!filteredDApps.length)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>🧐</AppText>
          <AppText>{t('No dApps match your search: "{{ searchText }}"', { searchText })}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  return (
    <DAppsListStyled>
      {filteredDApps.map((dAppName) => (
        <DAppCard key={dAppName} dAppName={dAppName} />
      ))}
    </DAppsListStyled>
  )
}

export default DAppsList

const filterDAppsByTag =
  (selectedTag: string | null) =>
  (dApps: DApp[]): DApp['name'][] =>
    (selectedTag ? dApps.filter((dApp) => dApp.tags.includes(selectedTag)) : dApps).map(({ name }) => name)

const filterDAppsByText = (searchText: string, dAppsNames: DApp['name'][]): DApp['name'][] =>
  searchText ? dAppsNames.filter((dAppName) => dAppName.toLowerCase().includes(searchText.toLowerCase())) : dAppsNames

const DAppsListStyled = styled(ScreenSection)`
  gap: ${VERTICAL_GAP / 2}px;
  margin-top: ${VERTICAL_GAP}px;
`
