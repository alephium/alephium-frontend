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
import { useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import BottomButtons from '~/components/buttons/BottomButtons'
import BaseHeader, { headerOffsetTop } from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface FlashListScreenProps<T>
  extends FlashListProps<T>,
    Omit<ScrollScreenBaseProps, 'contentContainerStyle'> {
  shouldUseGaps?: boolean
  contentPaddingTop?: boolean | number
}

const FlashListScreen = <T,>({
  headerOptions,
  fill,
  contentContainerStyle,
  style,
  screenTitle,
  screenIntro,
  shouldUseGaps,
  contentPaddingTop,
  bottomButtonsRender,
  ...props
}: FlashListScreenProps<T>) => {
  const insets = useSafeAreaInsets()
  const FlashListRef = useRef<FlashList<T>>(null)
  const [paddingBottom, setPaddingBottom] = useState(0)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  const handleBottomButtonsHeightChange = (newHeight: number) => {
    setPaddingBottom(newHeight)
  }

  return (
    <Screen>
      {headerOptions && <BaseHeader options={headerOptions} scrollY={screenScrollY} />}
      <FlashList
        ref={FlashListRef}
        onScroll={screenScrollHandler}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() =>
          screenTitle && (
            <ScreenIntro
              title={screenTitle}
              subtitle={screenIntro}
              scrollY={screenScrollY}
              paddingBottom={!!screenIntro}
            />
          )
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + paddingBottom,
          paddingTop:
            typeof contentPaddingTop === 'boolean'
              ? insets.top + headerOffsetTop + VERTICAL_GAP * 2
              : contentPaddingTop,
          ...contentContainerStyle
        }}
        {...props}
      />
      {bottomButtonsRender && (
        <BottomButtonsContainer>
          <BottomButtons float bottomInset onHeightChange={handleBottomButtonsHeightChange}>
            {bottomButtonsRender()}
          </BottomButtons>
        </BottomButtonsContainer>
      )}
    </Screen>
  )
}

export default FlashListScreen

const BottomButtonsContainer = styled.View`
  margin: 0 ${DEFAULT_MARGIN}px;
`
