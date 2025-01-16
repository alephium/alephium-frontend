import { getHumanReadableError } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import DAppCard from '~/features/ecosystem/DAppCard'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

const showComingSoon = true

const EcosystemScreen = () => {
  const { t } = useTranslation()

  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
    >
      {showComingSoon ? (
        <ComingSoonBanner />
      ) : (
        <>
          <AnimatedBackground isFullScreen isAnimated />
          <DAppsFilters selectedTag={selectedTag} onTagPress={setSelectedTag} />
          <DAppsList selectedTag={selectedTag} />
        </>
      )}
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

interface DAppsListProps {
  selectedTag: string | null
}

const DAppsList = ({ selectedTag }: DAppsListProps) => {
  const { t } = useTranslation()

  const {
    data: dApps,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['dApps'],
    queryFn: () => axios.get('https://publicapi.alph.land/api/dapps').then((res) => res.data as DApp[]), // TODO: Validate received data
    select: (dApps) => (selectedTag ? dApps.filter((dApp) => dApp.tags.includes(selectedTag)) : dApps)
  })

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

interface DAppsFiltersProps extends DAppsListProps {
  onTagPress: (tag: string | null) => void
}

const DAppsFilters = ({ selectedTag, onTagPress }: DAppsFiltersProps) => {
  const { data: dAppTags } = useQuery({
    queryKey: ['dApps'],
    queryFn: () => axios.get('https://publicapi.alph.land/api/dapps').then((res) => res.data as DApp[]), // TODO: Validate received data
    select: extractDAppTags
  })

  if (!dAppTags) return null

  return (
    <DAppsFiltersStyled horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      {dAppTags.map((tag) => (
        <Button
          title={tag}
          compact
          key={tag}
          onPress={() => onTagPress(selectedTag === tag ? null : tag)}
          variant={selectedTag === tag ? 'highlight' : undefined}
        />
      ))}
    </DAppsFiltersStyled>
  )
}

const DAppsFiltersStyled = styled.ScrollView`
  padding: 0 ${DEFAULT_MARGIN}px;
`

const DAppsListStyled = styled(ScreenSection)`
  gap: ${VERTICAL_GAP}px;
  margin-top: ${VERTICAL_GAP}px;
`

const extractDAppTags = (dApps: DApp[]) =>
  dApps
    .reduce((acc, dApp) => {
      dApp.tags.forEach((tag) => !acc.includes(tag) && acc.push(tag))
      return acc
    }, [] as string[])
    .sort()

const ComingSoonBanner = () => {
  const { t } = useTranslation()

  return (
    <ScreenSection>
      <EmptyPlaceholder>
        <AppText size={28}>📣👀</AppText>
        <AppText>{t('Coming soon!')}</AppText>
      </EmptyPlaceholder>
    </ScreenSection>
  )
}
