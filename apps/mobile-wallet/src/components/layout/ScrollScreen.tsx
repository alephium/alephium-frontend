import { useNavigation } from '@react-navigation/native'
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import BottomButtons from '~/components/buttons/BottomButtons'
import BaseHeader from '~/components/headers/BaseHeader'
import StackHeader from '~/components/headers/StackHeader'
import { ScreenProps } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScrollScreenBaseProps extends ScreenProps {
  contentContainerStyle?: StyleProp<ViewStyle>
  fill?: boolean
  screenTitle?: string
  screenIntro?: string
  headerTitleAlwaysVisible?: boolean
  floatingHeader?: boolean
  headerScrollEffectOffset?: number
  TitleSideComponent?: ReactNode
  bottomButtonsRender?: () => ReactNode
  customBottomRender?: () => ReactNode
}

export interface ScrollScreenProps extends ScrollScreenBaseProps, ScrollViewProps {
  containerStyle?: StyleProp<ViewStyle>
  verticalGap?: number | boolean
  contentPaddingTop?: number | boolean
  hasKeyboard?: boolean
}

const ScrollScreen = ({
  children,
  style,
  onScroll,
  containerStyle,
  contentContainerStyle,
  contentPaddingTop,
  verticalGap,
  fill,
  headerOptions,
  screenTitle,
  screenIntro,
  headerTitleAlwaysVisible,
  floatingHeader,
  headerScrollEffectOffset,
  TitleSideComponent,
  bottomButtonsRender,
  customBottomRender,
  hasKeyboard,
  ...props
}: ScrollScreenProps) => {
  const viewRef = useRef<ScrollView>(null)
  const navigation = useNavigation()
  const scrollEndHandler = useAutoScrollOnDragEnd(viewRef)
  const insets = useSafeAreaInsets()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const [paddingBottom, setPaddingBottom] = useState(0)
  const [canGoBack, setCanGoBack] = useState(false)

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll && onScroll(e)
    screenScrollHandler(e)
  }

  const handleBottomButtonsHeightChange = (newHeight: number) => {
    setPaddingBottom(newHeight)
  }

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  const hasHeaderButtons = headerOptions?.headerLeft || headerOptions?.headerRight || headerOptions?.type === 'stack'

  useEffect(() => {
    setCanGoBack(navigation.canGoBack())
  }, [navigation])

  const content = (
    <ScrollViewContainer style={containerStyle}>
      {headerOptions && (
        <HeaderComponent
          onBackPress={canGoBack ? navigation.goBack : undefined}
          options={{ headerTitle: screenTitle, ...headerOptions }}
          scrollY={screenScrollY}
          scrollEffectOffset={headerScrollEffectOffset}
          titleAlwaysVisible={headerTitleAlwaysVisible}
          style={floatingHeader ? { position: 'absolute', top: 0, left: 0, right: 0 } : undefined}
        />
      )}
      <ScrollView
        ref={viewRef}
        scrollEventThrottle={16}
        alwaysBounceVertical={true}
        onScroll={handleScroll}
        onScrollEndDrag={scrollEndHandler}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          {
            flexGrow: fill ? 1 : undefined,
            paddingTop:
              typeof contentPaddingTop === 'boolean'
                ? insets.top + HEADER_OFFSET_TOP + VERTICAL_GAP * (hasHeaderButtons ? 2 : 1)
                : contentPaddingTop,
            paddingBottom
          },
          contentContainerStyle
        ]}
        {...props}
      >
        {screenTitle && (
          <ScreenIntro
            title={screenTitle}
            subtitle={screenIntro}
            TitleSideComponent={TitleSideComponent}
            scrollY={screenScrollY}
            paddingBottom={!!screenIntro}
          />
        )}
        <View
          style={[
            {
              gap: verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0,
              paddingBottom: insets.bottom + DEFAULT_MARGIN,
              flex: fill ? 1 : undefined
            },
            style
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </ScrollViewContainer>
  )

  return (
    <>
      {hasKeyboard ? (
        <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {bottomButtonsRender && (
        <ColoredBackground>
          <BottomButtonsInnerContainer>
            <BottomButtons float bottomInset fullWidth onHeightChange={handleBottomButtonsHeightChange}>
              {bottomButtonsRender()}
            </BottomButtons>
          </BottomButtonsInnerContainer>
        </ColoredBackground>
      )}
      {customBottomRender && (
        <View>
          <CustomBottomRenderContainer>{customBottomRender()}</CustomBottomRenderContainer>
        </View>
      )}
    </>
  )
}

export default ScrollScreen

const ColoredBackground = styled.View`
  background-color: ${({ theme }) => theme.bg.back2};
`

const ScrollViewContainer = styled(ColoredBackground)`
  flex: 1;
`

const BottomButtonsInnerContainer = styled.View`
  margin: ${Platform.OS === 'ios' ? 0 : undefined} ${DEFAULT_MARGIN}px;
`

const CustomBottomRenderContainer = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
`
