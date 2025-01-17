import { getHumanReadableError } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
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
}

const DAppsList = ({ selectedTag }: DAppsListProps) => {
  const { t } = useTranslation()
  const favoriteDApps = useAppSelector(selectFavoriteDApps)

  const { data: dApps, isLoading, isError, error } = useQuery(dAppsQuery({ select: filterDAppsByTag(selectedTag) }))

  const filteredDApps = selectedTag === 'fav' ? favoriteDApps : dApps

  if (isLoading)
    return (
      <ScreenSection>
        <EmptyPlaceholder>
          <AppText size={32}>⏳</AppText>
          <AppText>{t('Loading dApps...')}</AppText>
        </EmptyPlaceholder>
      </ScreenSection>
    )

  if (isError || !filteredDApps)
    return (
      <ScreenSection>
        <EmptyPlaceholder>
          <AppText size={32}>🥺</AppText>
          <AppText>{t('Could not load dApps')}</AppText>
          <AppText>{getHumanReadableError(error, '')}</AppText>
        </EmptyPlaceholder>
      </ScreenSection>
    )

  if (selectedTag === 'fav' && !filteredDApps.length)
    return (
      <ScreenSection>
        <EmptyPlaceholder>
          <AppText size={32}>⭐️</AppText>
          <AppText>{t('No dApps added to your favorites yet')}</AppText>
        </EmptyPlaceholder>
      </ScreenSection>
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

const filterDAppsByTag = (selectedTag: string | null) => (dApps: DApp[]) =>
  (selectedTag ? dApps.filter((dApp) => dApp.tags.includes(selectedTag)) : dApps).map(({ name }) => name)

const DAppsListStyled = styled(ScreenSection)`
  gap: ${VERTICAL_GAP}px;
  margin-top: ${VERTICAL_GAP}px;
`
