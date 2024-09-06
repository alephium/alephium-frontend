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
import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { ReactNode } from 'react'
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

interface BlurredCardProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

const BlurredCard = ({ children, style }: BlurredCardProps) => {
  const theme = useTheme()
  return (
    <BlurredCardContainer style={style}>
      {Platform.OS === 'android' ? (
        <TransparentCardBackground style={StyleSheet.absoluteFill} />
      ) : (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={80}
          tint={theme.name === 'dark' ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
        />
      )}
      {children}
    </BlurredCardContainer>
  )
}

export default BlurredCard

const BlurredCardContainer = styled.View`
  flex: 1;
  border-radius: 38px;
  overflow: hidden;
`

const TransparentCardBackground = styled.View`
  background-color: ${({ theme }) => colord(theme.bg.primary).alpha(0.95).toHex()};
`
