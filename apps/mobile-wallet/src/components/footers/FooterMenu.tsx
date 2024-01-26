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
import { BlurView } from 'expo-blur'
import { Platform, StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css, useTheme } from 'styled-components/native'

import FooterMenuItem from '~/components/footers/FooterMenuItem'

interface FooterMenuProps extends BottomTabBarProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ state, descriptors, navigation, style }: FooterMenuProps) => {
  const insets = useSafeAreaInsets()
  const theme = useTheme()

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

  return (
    <View style={[style]}>
      {Platform.OS === 'ios' ? (
        <FooterMenuContentBlured tint={theme.name} intensity={100} style={{ paddingBottom: insets.bottom }}>
          {footerContent}
        </FooterMenuContentBlured>
      ) : (
        <FooterMenuContent style={{ paddingBottom: insets.bottom }}>{footerContent}</FooterMenuContent>
      )}
    </View>
  )
}

export default styled(FooterMenu)`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-top-color: ${({ theme }) => theme.border.secondary};
  border-top-width: 1px;
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
  background-color: ${({ theme }) => theme.bg.back2};
`

const FooterMenuContentBlured = styled(BlurView)`
  ${footerMenuStyles}
`
