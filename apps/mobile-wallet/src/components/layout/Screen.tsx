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
import { ViewProps } from 'react-native'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'
import BaseHeader, { BaseHeaderOptions } from '~/components/headers/BaseHeader'
import StackHeader from '~/components/headers/StackHeader'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface ScreenProps extends ViewProps {
  contrastedBg?: boolean
  headerOptions?: BaseHeaderOptions & {
    type?: 'default' | 'stack'
  }
}

const Screen = ({ children, headerOptions, ...props }: ScreenProps) => {
  const navigation = useNavigation()

  const HeaderComponent = headerOptions?.type === 'stack' ? StackHeader : BaseHeader

  return (
    <ScreenStyled {...props}>
      {headerOptions && (
        <HeaderComponent goBack={navigation.canGoBack() ? navigation.goBack : undefined} options={headerOptions} />
      )}
      {children}
    </ScreenStyled>
  )
}

const ScreenStyled = styled.View<ScreenProps>`
  flex: 1;
  background-color: ${({ theme, contrastedBg }) =>
    contrastedBg ? (theme.name === 'light' ? theme.bg.highlight : theme.bg.back2) : theme.bg.back1};
`

export default Screen

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

export const BottomModalScreenTitle = styled(AppText)`
  font-weight: 600;
  font-size: 28px;
`

export const ScreenSectionTitle = styled(AppText)`
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.primary};
  margin-bottom: 15px;
`
