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

import { useNavigation } from '@react-navigation/native'
import { useRef } from 'react'
import { FlatListProps } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import StackHeader from '~/components/headers/StackHeader'
import Screen from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { SCREEN_OVERFLOW, VERTICAL_GAP } from '~/style/globalStyle'

export interface FlatListScreenProps<T> extends FlatListProps<T>, ScrollScreenBaseProps {
  shouldUseGaps?: boolean
}

const FlatListScreen = <T,>({
  headerOptions,
  fill,
  contentContainerStyle,
  style,
  screenTitle,
  screenIntro,
  shouldUseGaps,
  ...props
}: FlatListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const scrollEndHandler = useAutoScrollOnDragEnd(flatListRef)
  const navigation = useNavigation()

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen>
      {headerOptions && (
        <StackHeader
          options={headerOptions}
          scrollY={screenScrollY}
          titleAlwaysVisible={props.headerTitleAlwaysVisible}
          onBackPress={navigation.canGoBack() ? navigation.goBack : undefined}
        />
      )}
      <FlatList
        ref={flatListRef}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={() =>
          screenTitle && (
            <ScreenIntro
              title={screenTitle}
              subtitle={screenIntro}
              scrollY={screenScrollY}
              paddingBottom={!!screenIntro && !shouldUseGaps}
            />
          )
        }
        contentContainerStyle={[
          {
            paddingBottom: insets.bottom,
            flex: fill ? 1 : undefined,
            gap: shouldUseGaps ? VERTICAL_GAP : 0,
            paddingTop: 120
          },
          contentContainerStyle
        ]}
        style={[{ overflow: SCREEN_OVERFLOW }, style]}
        {...props}
        // TODO: Remove when react-native-gesture-handler is updated to 2.17.X or above (after expo-doctor allows it)
        hitSlop={undefined}
      />
    </Screen>
  )
}

export default FlatListScreen
