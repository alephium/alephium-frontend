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
import React from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useTheme } from 'styled-components'

const useBottomModalOptions = (): StackNavigationOptions => {
  const theme = useTheme()
  const { height: screenHeight } = useWindowDimensions()

  return {
    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
    gestureEnabled: true,
    gestureDirection: 'vertical',
    gestureResponseDistance: screenHeight,
    cardStyle: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      borderRadius: 20,
      overflow: 'visible'
    },
    header: () => (
      <View
        style={{
          position: 'absolute',
          height: 7,
          top: -20,
          width: '100%',
          alignItems: 'center'
        }}
      >
        <View style={{ width: '30%', height: '100%', backgroundColor: theme.bg.tertiary, borderRadius: 20 }} />
      </View>
    )
  }
}

export default useBottomModalOptions
