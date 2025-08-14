import { FlashList, FlashListProps } from '@shopify/flash-list'
import { useRef, useState } from 'react'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import BottomButtons from '~/components/buttons/BottomButtons'
import Screen from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenBaseProps } from '~/components/layout/ScrollScreen'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP, VERTICAL_GAP } from '~/style/globalStyle'

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
    <Screen headerOptions={headerOptions} scrollY={screenScrollY}>
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
              ? insets.top + HEADER_OFFSET_TOP + VERTICAL_GAP * 2
              : contentPaddingTop,
          ...contentContainerStyle
        }}
        {...props}
      />
      {bottomButtonsRender && (
        <BottomButtonsContainer>
          <BottomButtons float bottomInset fullWidth onHeightChange={handleBottomButtonsHeightChange}>
            {bottomButtonsRender()}
          </BottomButtons>
        </BottomButtonsContainer>
      )}
    </Screen>
  )
}

export default FlashListScreen

const BottomButtonsContainer = styled.View`
  margin: ${Platform.OS === 'ios' ? 0 : undefined} ${DEFAULT_MARGIN}px;
`
