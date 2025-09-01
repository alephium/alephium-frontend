import { useNavigation } from '@react-navigation/native'
import { StyleProp, ViewProps, ViewStyle } from 'react-native'
import { SharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'
import BaseHeader, { BaseHeaderOptions } from '~/components/headers/BaseHeader'
import StackHeader from '~/components/headers/StackHeader'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScreenProps extends ViewProps {
  headerOptions?: BaseHeaderOptions & {
    type?: 'default' | 'stack'
  }
  titleAlwaysVisible?: boolean
  safeAreaPadding?: boolean
  scrollY?: SharedValue<number>
}

const Screen = ({ children, headerOptions, safeAreaPadding, titleAlwaysVisible, scrollY, ...props }: ScreenProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  const paddingStyle: StyleProp<ViewStyle> = safeAreaPadding
    ? { paddingTop: insets.top, paddingBottom: insets.bottom || 20 }
    : {}

  return (
    <ScreenStyled {...props} style={[props.style, paddingStyle]}>
      {headerOptions && (
        <HeaderComponent
          onBackPress={navigation.canGoBack() ? navigation.goBack : undefined}
          options={headerOptions}
          titleAlwaysVisible={titleAlwaysVisible}
          scrollY={scrollY}
        />
      )}
      {children}
    </ScreenStyled>
  )
}

export default Screen

const ScreenStyled = styled.View<ScreenProps>`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back2};
`

export interface ScreenSectionProps extends ViewProps {
  fill?: boolean
  noMargin?: boolean
  verticalGap?: number | boolean
  centered?: boolean
  verticallyCentered?: boolean
}

export const ScreenSection = styled.View<ScreenSectionProps>`
  margin: 0 ${({ noMargin }) => (noMargin ? 0 : DEFAULT_MARGIN)}px;

  gap: ${({ verticalGap }) =>
    verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0}px;

  ${({ fill }) =>
    fill &&
    css`
      flex-grow: 1;
      flex-shrink: 0;
    `}

  ${({ centered }) =>
    centered &&
    css`
      align-items: center;
    `}

  ${({ verticallyCentered }) =>
    verticallyCentered &&
    css`
      justify-content: center;
    `}
`

export const ModalScreenTitle = styled(AppText)`
  font-weight: 600;
  font-size: 28px;
  margin-top: 10px;
`

export const ScreenSectionTitle = styled(AppText)`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.tertiary};
  margin-bottom: 16px;
  margin-top: 16px;
  text-transform: uppercase;
`
