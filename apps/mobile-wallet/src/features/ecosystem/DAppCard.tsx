import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import { Pressable } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { BORDER_RADIUS } from '~/style/globalStyle'

const DAppCard = ({ name, media, links, short_description }: DApp) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleCardPress = () => {
    navigation.navigate('DAppWebViewScreen', { dAppUrl: links.website })
  }

  return (
    <CardContainer onPress={handleCardPress}>
      <DappIcon source={{ uri: media.logoUrl }} contentFit="cover" />
      <TextContent>
        <AppText bold>{name}</AppText>
        <AppText>{short_description}</AppText>
      </TextContent>
    </CardContainer>
  )
}

export default DAppCard

const CardContainer = styled(Pressable)`
  flex-direction: row;
  overflow: hidden;
  padding: 15px;
  gap: 15px;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${({ theme }) => theme.bg.secondary};
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
