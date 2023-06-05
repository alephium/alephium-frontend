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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { StyleProp, ViewStyle } from 'react-native'

import ScrollScreen from '~/components/layout/ScrollScreen'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { BackButton, ContinueButton } from '~/screens/Send/SendScreenHeader'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AssetsScreen'> {
  style?: StyleProp<ViewStyle>
}

const AssetsScreen = ({ navigation, style }: ScreenProps) => {
  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => <ContinueButton onPress={() => navigation.navigate('VerifyScreen')} />
    })
  })

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro title="Assets" subtitle="With Alephium, you can send multiple assets in one transaction." />
    </ScrollScreen>
  )
}

export default AssetsScreen
