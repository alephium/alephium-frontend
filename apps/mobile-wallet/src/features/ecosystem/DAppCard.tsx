import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { DApp } from '~/features/ecosystem/ecosystemTypes'
import RootStackParamList from '~/navigation/rootStackRoutes'

const DAppCard = ({ name, media, links }: DApp) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleCardPress = () => {
    navigation.navigate('DAppWebViewScreen', { dAppUrl: links.website })
  }

  return (
    <CardContainer onPress={handleCardPress}>
      <CardImage source={{ uri: media.bannerUrl }} contentFit="cover" />
      <AppText>{name}</AppText>
    </CardContainer>
  )
}

export default DAppCard

const CardContainer = styled.Pressable`
  align-items: center;
  background-color: ${({ theme }) => theme.bg.back1};
  border-radius: 9px;
  padding: 12px;
`

const CardImage = styled(Image)`
  height: 140px;
  width: 100%;
`
