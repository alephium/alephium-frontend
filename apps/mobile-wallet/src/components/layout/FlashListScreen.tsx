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

import { FlashList, FlashListProps } from '@shopify/flash-list'
import { useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'

export interface FlashListScreenProps<T>
  extends FlashListProps<T>,
    Omit<ScrollScreenBaseProps, 'contentContainerStyle'> {
  shouldUseGaps?: boolean
}

const FlashListScreen = <T,>({
  headerOptions,
  fill,
  contentContainerStyle,
  style,
  contrastedBg,
  screenTitle,
  screenIntro,
  shouldUseGaps,
  ...props
}: FlashListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const FlashListRef = useRef<FlashList<T>>(null)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen contrastedBg={contrastedBg}>
      {headerOptions && <BaseHeader options={headerOptions} scrollY={screenScrollY} />}
      <FlashList
        ref={FlashListRef}
        onScroll={screenScrollHandler}
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
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          ...contentContainerStyle
        }}
        {...props}
      />
    </Screen>
  )
}

export default FlashListScreen
