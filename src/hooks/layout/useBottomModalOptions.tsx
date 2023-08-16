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
import { Dimensions } from 'react-native'
import { useTheme } from 'styled-components'

import BottomModalHeader, { bottomModalHeights } from '~/components/headers/BottomModalHeader'

interface BottomModalOptions {
  height: number
}

const borderRadius = 10

const useBottomModalOptions = (options?: BottomModalOptions): StackNavigationOptions => {
  const theme = useTheme()

  return {
    cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
    gestureEnabled: true,
    gestureDirection: 'vertical',
    gestureResponseDistance: Dimensions.get('screen').height,
    cardStyle: {
      marginTop: bottomModalHeights.pullTab.container + (options?.height ?? 0),
      paddingTop: 15,
      borderTopRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      backgroundColor: theme.bg.primary
    },
    header: ({ options }) => <BottomModalHeader title={options.title} />
  }
}

export default useBottomModalOptions
