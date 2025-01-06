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
    setGradientHeight(buttonsContainerHeight + bottomInsetValue + 50)
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
        locations={[0.6, 1]}
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
