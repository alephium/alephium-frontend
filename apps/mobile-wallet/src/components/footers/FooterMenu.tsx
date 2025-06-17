import MaskedView from '@react-native-masked-view/masked-view'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colord } from 'colord'
import { BlurView } from 'expo-blur'
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
      <FooterBlurContainer style={{ height: gradientHeight }}>
        {Platform.OS === 'ios' ? (
          <MaskedView
            style={{ flex: 1 }}
            maskElement={
              <GradientMask
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                locations={[0.4, 0.6, 1]}
                colors={['black', 'rgba(0, 0, 0, 0.75)', 'transparent']}
                style={{ flex: 1 }}
                pointerEvents="none"
              />
            }
          >
            <BlurView tint={theme.name} intensity={80} style={{ flex: 1 }} />
          </MaskedView>
        ) : (
          <SimpleGradient
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            locations={[0.45, 1]}
            colors={[theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]}
            style={{ height: gradientHeight }}
            pointerEvents="none"
          />
        )}
      </FooterBlurContainer>
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

const FooterBlurContainer = styled.View`
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
`

const GradientMask = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const SimpleGradient = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
