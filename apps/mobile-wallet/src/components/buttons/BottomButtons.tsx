import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode, useState } from 'react'
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { DefaultTheme, useTheme } from 'styled-components/native'

import { VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomButtonsProps {
  children: ReactNode
  bottomInset?: boolean
  float?: boolean
  backgroundColor?: keyof DefaultTheme['bg']
  fullWidth?: boolean
  onHeightChange?: (newHeight: number) => void
  style?: StyleProp<ViewStyle>
}

const BottomButtons = ({
  children,
  bottomInset,
  float,
  fullWidth,
  backgroundColor = 'back2',
  onHeightChange,
  style
}: BottomButtonsProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [gradientHeight, setGradientHeight] = useState(0)

  const bottomInsetValue = bottomInset ? insets.bottom : 0

  const handleLayout = (e: LayoutChangeEvent) => {
    const buttonsContainerHeight = e.nativeEvent.layout.height
    onHeightChange?.(buttonsContainerHeight)
    setGradientHeight(buttonsContainerHeight + bottomInsetValue + 20)
  }

  return (
    <BottomButtonsStyled
      style={[
        { paddingBottom: bottomInsetValue },
        float ? { position: 'absolute', bottom: 0, right: 0, left: 0 } : {},
        style
      ]}
      pointerEvents="box-none"
    >
      <Gradient
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        locations={[0.5, 1]}
        colors={[theme.bg[backgroundColor], colord(theme.bg.back2).alpha(0).toHex()]}
        style={{ height: gradientHeight }}
        pointerEvents="none"
      />
      <ButtonsOuterContainer onLayout={handleLayout}>
        <ButtonsInnerContainer style={{ width: fullWidth ? '100%' : '80%' }}>{children}</ButtonsInnerContainer>
      </ButtonsOuterContainer>
    </BottomButtonsStyled>
  )
}

export default BottomButtons

const BottomButtonsStyled = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`

const Gradient = styled(LinearGradient)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`

const ButtonsOuterContainer = styled.View`
  justify-content: center;
  align-items: center;
`

const ButtonsInnerContainer = styled.View`
  gap: 20px;
`
