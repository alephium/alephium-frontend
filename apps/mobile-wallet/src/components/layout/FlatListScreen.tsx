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
