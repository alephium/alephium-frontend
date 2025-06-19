import MaskedView from '@react-native-masked-view/masked-view'
import { StackHeaderProps } from '@react-navigation/stack'
import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'
import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode, RefObject, useState } from 'react'
import { LayoutChangeEvent, Platform, useWindowDimensions, ViewProps } from 'react-native'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP } from '~/style/globalStyle'

export type BaseHeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
  headerTitleScrolled?: () => ReactNode
}

export interface BaseHeaderProps extends ViewProps {
  options: BaseHeaderOptions
  headerRef?: RefObject<Animated.View>
  titleAlwaysVisible?: boolean
  onBackPress?: () => void
  scrollY?: SharedValue<number>
  scrollEffectOffset?: number
  CustomContent?: ReactNode
  progress?: SceneProgress
  isCentered?: boolean
}

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight, headerTitleScrolled },
  headerRef,
  titleAlwaysVisible,
  scrollY,
  scrollEffectOffset = 0,
  CustomContent,
  progress,
  isCentered = true,
  ...props
}: BaseHeaderProps) => {
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  const [headerHeight, setHeaderHeight] = useState(80)

  const gradientHeight = headerHeight + 50
  const defaultScrollRange = [0 + scrollEffectOffset, 80 + scrollEffectOffset]
  const marginTop = insets.top + HEADER_OFFSET_TOP

  const headerTitleString = headerTitle && typeof headerTitle === 'string' ? headerTitle : undefined
  const HeaderTitleComponent =
    headerTitle && typeof headerTitle === 'function' ? headerTitle({ children: '' }) : undefined
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const gradientOpacityAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY?.get() || 0, defaultScrollRange, [0, 1])
  }))

  const headerTitleContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitle && !headerTitleScrolled && !titleAlwaysVisible
      ? {
          opacity: interpolate(scrollY?.get() || 0, [30 + scrollEffectOffset, 50 + scrollEffectOffset], [0, 1])
        }
      : headerTitle && headerTitleScrolled
        ? {
            opacity: interpolate(scrollY?.get() || 0, [30 + scrollEffectOffset, 50 + scrollEffectOffset], [1, 0])
          }
        : { opacity: 1 }
  )

  const headerTitleScrolledContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitleScrolled
      ? {
          opacity: interpolate(scrollY?.get() || 0, [40 + scrollEffectOffset, 60 + scrollEffectOffset], [0, 1])
        }
      : { opacity: 0 }
  )

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height)
  }

  return (
    <BaseHeaderStyled ref={headerRef} onLayout={handleHeaderLayout} {...props}>
      <HeaderGradientContainer
        pointerEvents="none"
        style={[gradientOpacityAnimatedStyle, { width: screenWidth, height: gradientHeight }]}
      >
        {Platform.OS === 'ios' ? (
          <MaskedView
            style={{ flex: 1 }}
            maskElement={
              <GradientMask
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0.5, 0.7, 1]}
                colors={['black', 'rgba(0, 0, 0, 0.8)', 'transparent']}
                style={{ flex: 1 }}
                pointerEvents="none"
              />
            }
          >
            <BlurView tint={theme.name} intensity={80} style={{ flex: 1 }} />
          </MaskedView>
        ) : (
          <SimpleGradient
            pointerEvents="none"
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            locations={[0.7, 1]}
            colors={[theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]}
          />
        )}
      </HeaderGradientContainer>
      <HeaderContainer>
        <Header style={{ marginTop }}>
          {!CustomContent ? (
            <>
              <HeaderSideContainer side="left">{headerLeft?.({})}</HeaderSideContainer>
              {(headerTitleString || HeaderTitleComponent) && (
                <HeaderTitleContainer style={headerTitleContainerAnimatedStyle} isCentered={isCentered}>
                  {headerTitleString ? (
                    <AppText truncate semiBold size={17}>
                      {headerTitleString}
                    </AppText>
                  ) : HeaderTitleComponent ? (
                    HeaderTitleComponent
                  ) : null}
                  {HeaderTitleRight}
                </HeaderTitleContainer>
              )}
              <HeaderSideContainer side="right">{headerRight?.({})}</HeaderSideContainer>
            </>
          ) : (
            <HeaderTitleContainer isCentered={isCentered}>{CustomContent}</HeaderTitleContainer>
          )}
          {headerTitleScrolled && (
            <HeaderTitleScrolledContainer style={headerTitleScrolledContainerAnimatedStyle} pointerEvents="none">
              {headerTitleScrolled()}
            </HeaderTitleScrolledContainer>
          )}
        </Header>
      </HeaderContainer>
    </BaseHeaderStyled>
  )
}

export default BaseHeader

const BaseHeaderStyled = styled(Animated.View)`
  position: absolute;
  width: 100%;
  z-index: 1;
`

const HeaderGradientContainer = styled(Animated.View)`
  position: absolute;
  top: 0;
  opacity: 0;
`

const GradientMask = styled(LinearGradient)`
  height: 100%;
  width: 100%;
`

const SimpleGradient = styled(LinearGradient)`
  height: 100%;
  width: 100%;
`

const HeaderContainer = styled(Animated.View)`
  flex-direction: column;
`

const HeaderTitleContainer = styled(Animated.View)<{ isCentered?: boolean }>`
  flex: 1;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: ${({ isCentered }) => (isCentered ? 'center' : 'flex-start')};
  opacity: 1;
`

const HeaderTitleScrolledContainer = styled(Animated.View)`
  position: absolute;
  flex-direction: row;
  right: 0;
  left: 0;
  bottom: 0;
  top: 0;
  align-items: center;
  justify-content: center;
`

const Header = styled(Animated.View)`
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${DEFAULT_MARGIN}px;
`

const HeaderSideContainer = styled.View<{ side: 'left' | 'right' }>`
  min-width: 50px;
  flex-direction: row;
  justify-content: ${({ side }) => (side === 'left' ? 'flex-start' : 'flex-end')};
`
