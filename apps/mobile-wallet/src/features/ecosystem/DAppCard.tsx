import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { dAppQuery } from '~/api/queries/dAppQueries'
import AppText from '~/components/AppText'
import AnimatedPressable from '~/components/layout/AnimatedPressable'
import DAppIcon from '~/features/ecosystem/DAppIcon'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

interface DAppCardProps {
  dAppName: string
}

const DAppCard = ({ dAppName }: DAppCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()

  const { data: dApp } = useQuery(dAppQuery(dAppName))

  if (!dApp) return null

  const handleCardPress = () => {
    navigation.navigate('DAppWebViewScreen', { dAppUrl: dApp.links.website, dAppName: dApp.name })
    sendAnalytics({ event: 'Opened dApp', props: { origin: 'dapp_card', dAppName } })
  }

  const handleLongPress = () => {
    dispatch(openModal({ name: 'DAppQuickActionsModal', props: { dAppName } }))
    // TODO: send analytics
  }

  return (
    <DappCardStyled onPress={handleCardPress} onLongPress={handleLongPress}>
      <DAppIcon dAppName={dAppName} />
      <TextContent>
        <AppText bold>{dApp.name}</AppText>
        <AppText>{dApp.short_description}</AppText>
      </TextContent>
    </DappCardStyled>
  )
}

export default DAppCard

const DappCardStyled = styled(AnimatedPressable)`
  flex-direction: row;
  overflow: hidden;
  padding: 15px;
  gap: 15px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.secondary};
`

const TextContent = styled.View`
  gap: 5px;
  flex: 1;
`
