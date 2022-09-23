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

import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from './AppText'

interface NoticeProps {
  title: string
  body: string
  icon: ReactNode
  style?: StyleProp<ViewStyle>
}

const Notice = ({ title, body, icon, style }: NoticeProps) => (
  <View style={style}>
    <CellIcon>{icon}</CellIcon>
    <View>
      <Title>{title}</Title>
      <Body>{body}</Body>
    </View>
  </View>
)

export default styled(Notice)`
  flex-direction: row;
  align-items: center;
  background-color: rgba(200, 0, 0, 0.1);
  border-radius: 12px;
  padding: 38px 33px;
`

const Title = styled(AppText)`
  font-weight: 700;
  font-size: 18px;
`

const Body = styled(AppText)`
  font-weight: 600;
  font-size: 16px;
`

const CellIcon = styled.View`
  align-items: center;
  margin-right: 20px;
`
