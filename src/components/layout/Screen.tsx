/*
Copyright 2018 - 2022 The Alephium Authors
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

import { ViewProps } from 'react-native'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export type ScreenProps = ViewProps

export default styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back2};
`

export const ScreenSection = styled.View<{ fill?: boolean; noMargin?: boolean; verticalGap?: number | boolean }>`
  margin: 0 ${({ noMargin }) => (noMargin ? 0 : DEFAULT_MARGIN)}px;

  gap: ${({ verticalGap }) =>
    verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0}px;

  ${({ fill }) =>
    fill &&
    css`
      flex: 1;
    `}
`

export const CenteredScreenSection = styled(ScreenSection)`
  align-items: center;
`

export const BottomModalScreenHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
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

export const BottomScreenSection = styled(ScreenSection)`
  margin-bottom: 20px;
  align-items: center;
`
