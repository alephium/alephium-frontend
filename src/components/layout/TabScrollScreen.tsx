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

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useRef } from 'react'
import { ScrollView, ScrollViewProps, View } from 'react-native'

import { useScrollContext } from '~/contexts/ScrollContext'
import { HORIZONTAL_MARGIN } from '~/style/globalStyle'

import Screen from './Screen'

export type ScrollScreenProps = ScrollViewProps

const TabScrollScreen = ({ children, style, ...props }: ScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)
  const navigation = useNavigation()
  const { setScrollToTop } = useScrollContext()
  const headerheight = useHeaderHeight()
  const bottomBarHeight = useBottomTabBarHeight()

  useEffect(() => {
    navigation.addListener('blur', () => viewRef.current?.scrollTo({ y: 0, animated: false }))
  }, [navigation])

  useFocusEffect(
    useCallback(() => setScrollToTop(() => () => viewRef.current?.scrollTo({ y: 0, animated: true })), [setScrollToTop])
  )

  return (
    <Screen>
      <ScrollView
        contentOffset={{ y: 0, x: 0 }}
        ref={viewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={false}
        contentContainerStyle={{
          paddingTop: headerheight + HORIZONTAL_MARGIN,
          paddingBottom: bottomBarHeight + HORIZONTAL_MARGIN
        }}
        {...props}
      >
        <View style={style}>{children}</View>
      </ScrollView>
    </Screen>
  )
}

export default TabScrollScreen
