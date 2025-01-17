import { getHumanReadableError } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { dAppQueries } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSection } from '~/components/layout/Screen'
import DAppCard from '~/features/ecosystem/DAppCard'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface DAppsListProps {
  selectedTag: string | null
}

const DAppsList = ({ selectedTag }: DAppsListProps) => {
  const { t } = useTranslation()

  const { data: dApps, isLoading, isError, error } = useQuery(dAppQueries({ select: filterDAppsByTag(selectedTag) }))

  if (isLoading)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>⏳</AppText>
        <AppText>{t('Loading dApps...')}</AppText>
      </EmptyPlaceholder>
    )

  if (isError || !dApps)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>🥺</AppText>
        <AppText>{t('Could not load dApps')}</AppText>
        <AppText>{getHumanReadableError(error, '')}</AppText>
      </EmptyPlaceholder>
    )

  return (
    <DAppsListStyled>
      {dApps.map((dApp) => (
        <DAppCard key={dApp.name} {...dApp} />
      ))}
    </DAppsListStyled>
  )
}

export default DAppsList

const filterDAppsByTag = (selectedTag: string | null) => (dApps: DApp[]) =>
  selectedTag ? dApps.filter((dApp) => dApp.tags.includes(selectedTag)) : dApps

const DAppsListStyled = styled(ScreenSection)`
  gap: ${VERTICAL_GAP}px;
  margin-top: ${VERTICAL_GAP}px;
`
