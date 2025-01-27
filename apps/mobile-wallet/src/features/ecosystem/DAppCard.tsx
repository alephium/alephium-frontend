import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'
import styled from 'styled-components/native'

import { dAppsQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { BORDER_RADIUS, BORDER_RADIUS_BIG } from '~/style/globalStyle'

interface DAppCardProps {
  dAppName: string
}

const DAppCard = ({ dAppName }: DAppCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const { data: dApp } = useQuery(dAppsQuery({ select: selectDAppByName(dAppName) }))

  if (!dApp) return null

  const handleCardPress = () => {
    navigation.navigate('DAppWebViewScreen', { dAppUrl: dApp.links.website, dAppName: dApp.name })
  }

  return (
    <DappCardStyled onPress={handleCardPress}>
      <DappIcon source={{ uri: dApp.media.logoUrl }} contentFit="cover" />
      <TextContent>
        <AppText bold>{dApp.name}</AppText>
        <AppText>{dApp.short_description}</AppText>
      </TextContent>
    </DappCardStyled>
  )
}

export default DAppCard

const selectDAppByName = (dAppName: string) => (dApps: DApp[]) => dApps.find((dApp) => dApp.name === dAppName)

const DappCardStyled = styled(Pressable)`
  flex-direction: row;
  overflow: hidden;
  padding: 15px;
  gap: 15px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.secondary};
`

const DappIcon = styled(Image)`
  height: 70px;
  width: 70px;
  border-radius: ${BORDER_RADIUS}px;
`

const TextContent = styled.View`
  gap: 5px;
  flex: 1;
`
