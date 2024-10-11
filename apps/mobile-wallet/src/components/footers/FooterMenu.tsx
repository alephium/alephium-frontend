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
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css, useTheme } from 'styled-components/native'

import FooterMenuItem from '~/components/footers/FooterMenuItem'

interface FooterMenuProps extends BottomTabBarProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ state, descriptors, navigation, style }: FooterMenuProps) => {
  const insets = useSafeAreaInsets()
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
    <View style={style} onLayout={handleFooterLayout}>
      <FooterGradient
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        locations={[0.45, 1]}
        colors={
          theme.name === 'dark'
            ? [theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]
            : [theme.bg.highlight, colord(theme.bg.highlight).alpha(0).toHex()]
        }
        style={{ height: gradientHeight }}
      />
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

const FooterGradient = styled(LinearGradient)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`
