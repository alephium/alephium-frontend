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

import { useHeaderHeight } from '@react-navigation/elements'
import { Platform, StyleProp, View, ViewProps, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen from '~/components/layout/Screen'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface StaticScreenProps extends ViewProps {
  hasHeader?: boolean
  containerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  verticalGap?: number | boolean
}

const StaticScreen = ({
  children,
  hasHeader,
  style,
  containerStyle,
  contentContainerStyle,
  verticalGap,
  ...props
}: StaticScreenProps) => {
  const headerheight = useHeaderHeight()
  const insets = useSafeAreaInsets()

  return (
    <Screen style={containerStyle}>
      <View
        style={[
          contentContainerStyle,
          {
            flex: 1,
            paddingTop: hasHeader ? headerheight + DEFAULT_MARGIN : 0
          }
        ]}
        {...props}
      >
        <View
          style={[
            style,
            {
              flex: 1,
              gap: verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0,
              paddingBottom: Platform.OS === 'android' ? insets.bottom + DEFAULT_MARGIN : insets.bottom
            }
          ]}
        >
          {children}
        </View>
      </View>
    </Screen>
  )
}

export default StaticScreen
