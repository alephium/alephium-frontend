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

import { View } from 'react-native'
import { SafeAreaViewProps } from 'react-native-safe-area-context'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'

const Screen = ({ children, style }: SafeAreaViewProps) => <View style={style}>{children}</View>

export default styled(Screen)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.back1};
`

export const ScreenSection = styled.View<{ fill?: boolean }>`
  padding: 20px 15px 10px 15px;

  ${({ fill }) =>
    fill &&
    css`
      flex: 1;
    `}
`

export const CenteredScreenSection = styled(ScreenSection)`
  align-items: center;
`

export const BottomModalScreenTitle = styled(AppText)`
  font-weight: 600;
  font-size: 26px;
`

export let BottomModal = ({ children, style }: SafeAreaViewProps) => <View style={style}>{children}</View>

BottomModal = styled(BottomModal)`
  background-color: ${({ theme }) => theme.bg.secondary};
  top: 400px;
  position: absolute;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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
