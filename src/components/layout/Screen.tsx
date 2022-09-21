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

import { SafeAreaView } from 'react-native'
import { SafeAreaViewProps } from 'react-navigation'
import styled, { css } from 'styled-components/native'

const Screen = ({ children, style }: SafeAreaViewProps) => <SafeAreaView style={style}>{children}</SafeAreaView>

export default styled(Screen)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.secondary};
`

export const ScreenSection = styled.View<{ fill?: boolean }>`
  padding: 22px 20px;

  ${({ fill }) =>
    fill &&
    css`
      flex: 1;
    `}
`

export const CenteredScreenSection = styled(ScreenSection)`
  align-items: center;
`

export const BottomModalScreenTitle = styled.Text`
  font-weight: 600;
  font-size: 26px;
`

export let BottomModal = ({ children, style }: SafeAreaViewProps) => (
  <SafeAreaView style={style}>{children}</SafeAreaView>
)
BottomModal = styled(BottomModal)`
  background-color: ${({ theme }) => theme.bg.secondary};
  top: 400px;
  position: absolute;
  border-radius-top-left: 20px;
  border-radius-top-right: 20px;
`

export const ScreenSectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.tertiary};
  margin-left: 8px;
  margin-bottom: 24px;
`
