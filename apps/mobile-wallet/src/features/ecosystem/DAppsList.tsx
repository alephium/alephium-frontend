import { getHumanReadableError } from '@alephium/shared'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSection } from '~/components/layout/Screen'
import DAppCard from '~/features/ecosystem/DAppCard'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { getValidUrl } from '~/features/ecosystem/ecosystemUtils'
import { selectFavoriteDApps } from '~/features/ecosystem/favoriteDApps/favoriteDAppsSelectors'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface DAppsListProps {
  selectedTag: string | null
  searchText: string
}

const DAppsList = ({ selectedTag, searchText }: DAppsListProps) => {
  const { t } = useTranslation()
  const favoriteDApps = useAppSelector(selectFavoriteDApps)
  const { data: dApps, isLoading, isError, error } = useQuery(dAppsQuery({ select: filterDAppsByTag(selectedTag) }))

  const [readableError, setReadableError] = useState<string>()

  useEffect(() => {
    if (error) {
      try {
        setReadableError(getHumanReadableError(error, ''))
      } catch (error) {
        console.error('Error getting human readable error', error)
        setReadableError(t('Unknown error'))
      }
    } else {
      setReadableError(undefined)
    }
  }, [error, t])

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

  if ((isError || !filteredDApps) && !searchText)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>🥺</AppText>
          <AppText>{t('Could not load dApps')}</AppText>
          <AppText>{readableError}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  if (selectedTag === 'fav' && tagFilteredDApps && !tagFilteredDApps.length)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>💔</AppText>
          <AppText>{t('No dApps added to your favorites yet')}</AppText>
        </EmptyPlaceholder>
      </DAppsListStyled>
    )

  if (!filteredDApps?.length)
    return (
      <DAppsListStyled>
        <EmptyPlaceholder>
          <AppText size={32}>🧐</AppText>
          <AppText>{t('No dApps match your search')}</AppText>
          <AppText color="tertiary">"{searchText}"</AppText>
          <OpenUrlButton searchText={searchText} />
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

const OpenUrlButton = ({ searchText }: { searchText: string }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const dAppUrl = useMemo(() => getValidUrl(searchText), [searchText])

  if (!dAppUrl) return null

  const openDappBrowser = () => navigation.navigate('DAppWebViewScreen', { dAppUrl, dAppName: '' })

  return (
    <Button
      compact
      title={t('Visit website')}
      onPress={openDappBrowser}
      iconProps={{ name: 'open-outline' }}
      variant="accent"
    />
  )
}

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
