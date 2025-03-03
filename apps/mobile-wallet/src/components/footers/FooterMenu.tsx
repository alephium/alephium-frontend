import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { LayoutChangeEvent, Platform, StyleProp, View, ViewStyle } from 'react-native'
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

  const gradientHeight = footerHeight + 50

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
    setFooterHeight(e.nativeEvent.layout.height)
  }

  return (
    <View style={style} onLayout={handleFooterLayout}>
      <FooterGradient
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        locations={[0.45, 1]}
        colors={[theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]}
        style={{ height: gradientHeight }}
        pointerEvents="none"
      />
      <FooterMenuContent style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 18 }}>
        {footerContent}
      </FooterMenuContent>
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
  height: 100%;
  padding-top: 5px;
`

const FooterMenuContent = styled.View`
  ${footerMenuStyles}
`

// Bottom value is to avoid glitch on Android
const FooterGradient = styled(LinearGradient)`
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
`
