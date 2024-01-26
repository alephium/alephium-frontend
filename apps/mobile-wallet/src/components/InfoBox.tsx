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

import { LucideProps } from 'lucide-react-native'
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

interface InfoBoxProps {
  title: string
  Icon: (props: LucideProps) => JSX.Element
  children: ReactNode
  iconColor?: string
  bgColor?: string
  style?: StyleProp<ViewStyle>
}

const InfoBox = ({ title, Icon, iconColor, children, style }: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <View style={style}>
      <IconColumn>
        <Icon size={64} color={iconColor ?? theme.font.primary} />
      </IconColumn>
      <ContentColumn>
        <Title>{title}</Title>
        <Content>{children}</Content>
      </ContentColumn>
    </View>
  )
}

export default styled(InfoBox)`
  flex-direction: row;
  align-items: center;
  background-color: ${({ bgColor, theme }) => bgColor ?? theme.bg.secondary};
  border-radius: 12px;
  padding: 38px 33px;
`

const IconColumn = styled.View`
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
  flex-grow: 1;
`

const ContentColumn = styled.View`
  flex-shrink: 1;
`

const Title = styled(AppText)`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`

const Content = styled.View`
  font-weight: 600;
  font-size: 16px;
`
