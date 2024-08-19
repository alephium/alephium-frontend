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

import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia'
import { useState } from 'react'
import { LayoutChangeEvent, StyleProp, useWindowDimensions, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css, useTheme } from 'styled-components/native'

import FooterMenuItem from '~/components/footers/FooterMenuItem'

interface FooterMenuProps extends BottomTabBarProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ state, descriptors, navigation, style }: FooterMenuProps) => {
  const insets = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const theme = useTheme()
  const [footerHeight, setFooterHeight] = useState(120)

  const gradientHeight = footerHeight + 30

  const footerContent = (
    <>
      {state.routes.map((route, index) => (
        <FooterMenuItem
          options={descriptors[route.key].options}
          isFocused={state.index === index}
          routeName={route.name}
          target={route.key}
          navigation={navigation}
          key={route.name}
        />
      ))}
    </>
  )

  const handleFooterLayout = (e: LayoutChangeEvent) => {
    setFooterHeight(e.nativeEvent.layout.height + insets.bottom)
  }

  return (
    <View style={[style]} onLayout={handleFooterLayout}>
      <FooterGradientCanvas pointerEvents="none" height={gradientHeight}>
        <Rect x={0} y={0} width={screenWidth} height={gradientHeight}>
          <LinearGradient
            start={vec(0, gradientHeight / 1.9)}
            end={vec(0, 0)}
            colors={
              theme.name === 'dark'
                ? ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']
                : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']
            }
          />
        </Rect>
      </FooterGradientCanvas>
      <FooterMenuContent style={{ paddingBottom: insets.bottom }}>{footerContent}</FooterMenuContent>
    </View>
  )
}

export default styled(FooterMenu)`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
`

const footerMenuStyles = css`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-top: 5px;
`

const FooterMenuContent = styled.View`
  ${footerMenuStyles}
`

const FooterGradientCanvas = styled(Canvas)<{ height: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ height }) => height}px;
`
