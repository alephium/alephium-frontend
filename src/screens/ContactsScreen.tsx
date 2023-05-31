/*
Copyright 2018 - 2022 The Alephium Authors
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

import { StackScreenProps } from '@react-navigation/stack'
import { Plus } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ScreenProps extends StackScreenProps<AddressTabsParamList & RootStackParamList, 'ContactsScreen'> {
  style?: StyleProp<ViewStyle>
}

const ContactsScreen = ({ navigation, style }: ScreenProps) => (
  <>
    <ScrollScreenStyled style={style}>
      <ScreenSection>
        <AppText>TODO: Contacts go here</AppText>
      </ScreenSection>
    </ScrollScreenStyled>
    <FloatingButton Icon={Plus} round variant="accent" color="white" />
  </>
)

export default ContactsScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const FloatingButton = styled(Button)`
  position: absolute;
  bottom: 18px;
  right: 18px;
`
