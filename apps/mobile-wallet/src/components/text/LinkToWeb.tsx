/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Linking, StyleProp, TextStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface LinkToWebProps {
  text: string
  url: string
  style?: StyleProp<TextStyle>
}

const LinkToWeb = ({ text, url, style }: LinkToWebProps) => {
  const handleLinkPress = () => {
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open web page: ', err)
      alert('Failed to open page')
    })
  }

  return (
    <AppText onPress={handleLinkPress} style={style}>
      {text}
    </AppText>
  )
}

export default styled(LinkToWeb)`
  color: ${({ theme }) => theme.global.accent};
`
