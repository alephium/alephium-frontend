import { StackHeaderProps } from '@react-navigation/stack'
import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode, RefObject, useState } from 'react'
import { LayoutChangeEvent, Platform, useWindowDimensions, View, ViewProps } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import useSceneProgressSharedValues from '~/hooks/layout/useSceneProgressSharedValues'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export type BaseHeaderOptions = Pick<StackHeaderProps['options'], 'headerRight' | 'headerLeft' | 'headerTitle'> & {
  headerTitleRight?: () => ReactNode
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

export const headerOffsetTop = Platform.OS === 'ios' ? 0 : 16

const AnimatedHeaderGradient = Animated.createAnimatedComponent(LinearGradient)

const BaseHeader = ({
  options: { headerRight, headerLeft, headerTitle, headerTitleRight },
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
  const { currentProgress, nextProgress } = useSceneProgressSharedValues(progress)

  const gradientHeight = headerHeight + 42
  const defaultScrollRange = [0 + scrollEffectOffset, 80 + scrollEffectOffset]
  const paddingTop = insets.top + headerOffsetTop

  const HeaderRight = (headerRight && headerRight({})) || <HeaderSidePlaceholder />
  const HeaderLeft = (headerLeft && headerLeft({})) || <HeaderSidePlaceholder />
  const headerTitleString = headerTitle && typeof headerTitle === 'string' ? headerTitle : undefined
  const HeaderTitleComponent =
    headerTitle && typeof headerTitle === 'function' ? headerTitle({ children: '' }) : undefined
  const HeaderTitleRight = headerTitleRight && headerTitleRight()

  const animatedHeaderOpacity = progress
    ? interpolate(currentProgress.value + (nextProgress.value || 0), [0, 1, 2], [0, 1, 0])
    : 1
  const animatedGradientOpacity = useDerivedValue(() => interpolate(scrollY?.value || 0, defaultScrollRange, [0, 1]))

  const headerTitleContainerAnimatedStyle = useAnimatedStyle(() =>
    headerTitle && !titleAlwaysVisible
      ? {
          opacity: interpolate(
            scrollY?.value || 0,
            [30 + scrollEffectOffset, 50 + scrollEffectOffset],
            [0, 1],
            Extrapolation.CLAMP
          )
        }
      : { opacity: 1 }
  )

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height)
  }

  return (
    <BaseHeaderStyled
      ref={headerRef}
      onLayout={handleHeaderLayout}
      style={{ opacity: animatedHeaderOpacity }}
      {...props}
    >
      <View pointerEvents="none">
        <HeaderGradient
          pointerEvents="none"
          style={{ opacity: animatedGradientOpacity, width: screenWidth, height: gradientHeight }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          locations={[0.6, 1]}
          colors={[theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]}
        />
      </View>
      <HeaderContainer>
        <Header style={{ paddingTop }}>
          {!CustomContent ? (
            <>
              {HeaderLeft}
              {(headerTitleString || HeaderTitleComponent) && (
                <HeaderTitleContainer style={headerTitleContainerAnimatedStyle} isCentered={isCentered}>
                  {headerTitleString ? (
                    <AppText semiBold size={17}>
                      {headerTitleString}
                    </AppText>
                  ) : HeaderTitleComponent ? (
                    HeaderTitleComponent
                  ) : null}
                  {HeaderTitleRight}
                </HeaderTitleContainer>
              )}
              {HeaderRight}
            </>
          ) : (
            <HeaderTitleContainer isCentered={isCentered}>{CustomContent}</HeaderTitleContainer>
          )}
        </Header>
      </HeaderContainer>
    </BaseHeaderStyled>
  )
}

export default BaseHeader

const BaseHeaderStyled = styled(Animated.View)`
  width: 100%;
  z-index: 1;
  position: absolute;
`

const HeaderGradient = styled(AnimatedHeaderGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
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

const Header = styled(Animated.View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${DEFAULT_MARGIN - 4}px 12px;
`

const HeaderSidePlaceholder = styled.View`
  width: 40px;
`
