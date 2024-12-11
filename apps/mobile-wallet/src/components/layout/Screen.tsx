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

import { useNavigation } from '@react-navigation/native'
import { KeyboardAvoidingView, StyleProp, ViewProps, ViewStyle } from 'react-native'
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
  safeAreaPadding?: boolean
}

const Screen = ({ children, headerOptions, safeAreaPadding, ...props }: ScreenProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  const paddingStyle: StyleProp<ViewStyle> = safeAreaPadding
    ? { paddingTop: insets.top, paddingBottom: insets.bottom }
    : {}

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <ScreenStyled {...props} style={[props.style, paddingStyle]}>
        {headerOptions && (
          <HeaderComponent
            onBackPress={navigation.canGoBack() ? navigation.goBack : undefined}
            options={headerOptions}
          />
        )}
        {children}
      </ScreenStyled>
    </KeyboardAvoidingView>
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
`

export const ScreenSectionTitle = styled(AppText)`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.tertiary};
  margin-bottom: 16px;
  margin-top: 16px;
  text-transform: uppercase;
`
