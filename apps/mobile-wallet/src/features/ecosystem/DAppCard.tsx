import { Image } from 'expo-image'
import * as WebBrowser from 'expo-web-browser'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { DApp } from '~/features/ecosystem/ecosystemTypes'

const DAppCard = ({ name, media, links }: DApp) => {
  const handleCardPress = async () => {
    await WebBrowser.openBrowserAsync(links.website)
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
