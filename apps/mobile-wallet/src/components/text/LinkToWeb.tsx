import { Linking, StyleProp, TextStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface LinkToWebProps {
  url: string
  children?: string
  style?: StyleProp<TextStyle>
}

const LinkToWeb = ({ children, url, style }: LinkToWebProps) => {
  const handleLinkPress = () => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open web page: ', err)
      alert('Failed to open page')
    })
  }

  return (
    <AppText onPress={handleLinkPress} style={style}>
      {children}
    </AppText>
  )
}

export default styled(LinkToWeb)`
  color: ${({ theme }) => theme.global.accent};
`
