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

import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack'
import { Dimensions, View } from 'react-native'
import { useTheme } from 'styled-components'

interface BottomModalOptions {
  height: number
}

const heights = {
  pullTab: {
    container: 20,
    bar: 4
  }
}

const borderRadius = 10

const useBottomModalOptions = (options?: BottomModalOptions): StackNavigationOptions => {
  const theme = useTheme()

  const { height } = options ?? {}

  return {
    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
    gestureEnabled: true,
    gestureDirection: 'vertical',
    gestureResponseDistance: Dimensions.get('window').height,
    cardStyle: {
      marginTop: heights.pullTab.container + (height ?? 0),
      paddingTop: 15,
      borderRadius,
      backgroundColor: theme.bg.primary
    },
    header: () => (
      <View
        style={{
          position: 'absolute',
          height: heights.pullTab.bar,
          width: '100%',
          alignItems: 'center'
        }}
      >
        <View style={{ width: 35, height: '100%', backgroundColor: theme.font.tertiary, borderRadius: 20 }} />
      </View>
    )
  }
}

export default useBottomModalOptions
