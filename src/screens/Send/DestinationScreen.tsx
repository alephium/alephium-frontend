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
import { useEffect } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import ScrollScreen from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'DestinationScreen'> {
  style?: StyleProp<ViewStyle>
}

const DestinationScreen = ({ navigation, style }: ScreenProps) => {
  const { setOnBack, setOnContinue, setIsContinueEnabled } = useSendContext()

  useEffect(() => {
    setOnBack(() => navigation.goBack())
    setOnContinue(() => navigation.navigate('OriginScreen'))
    setIsContinueEnabled(true)
  }, [navigation, setIsContinueEnabled, setOnBack, setOnContinue])

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro
        title="Destination"
        subtitle="Send to a custom address, a contact, or one of you other addresses."
      />
    </ScrollScreen>
  )
}

export default DestinationScreen
