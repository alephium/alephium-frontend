import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import Button from '~/components/buttons/Button'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import DAppCard from '~/features/ecosystem/DAppCard'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

const EcosystemScreen = () => {
  const { t } = useTranslation()
  const [dApps, setDApps] = useState<DApp[]>([])

  useEffect(() => {
    fetch('https://publicapi.alph.land/api/dapps').then((res) => res.json().then((data) => setDApps(data)))
  }, [])

  const dAppTags = dApps
    .reduce((acc, dApp) => {
      dApp.tags.forEach((tag) => {
        if (!acc.includes(tag)) {
          acc.push(tag)
        }
      })
      return acc
    }, [] as string[])
    .sort()

  return (
    <BottomBarScrollScreen
      screenTitle={t('Ecosystem')}
      screenIntro="Discover the Alephium ecosystem, interact with dApps, and more!"
      headerOptions={{ headerTitle: t('Ecosystem') }}
      contentPaddingTop
      hasBottomBar
    >
      <AnimatedBackground isFullScreen isAnimated />
      <DAppFilters horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {dAppTags.map((tag) => (
          <Button title={tag} compact />
        ))}
      </DAppFilters>
      <DAppList>
        {dApps.map((dApp) => (
          <DAppCard key={dApp.name} {...dApp} />
        ))}
      </DAppList>
    </BottomBarScrollScreen>
  )
}

export default EcosystemScreen

const DAppFilters = styled.ScrollView`
  padding: 0 ${DEFAULT_MARGIN}px;
`

const DAppList = styled(ScreenSection)`
  gap: ${VERTICAL_GAP}px;
  margin-top: ${VERTICAL_GAP}px;
`
