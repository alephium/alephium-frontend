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
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

interface BottomButtonsProps {
  children: ReactNode
  bottomInset?: boolean
  style?: StyleProp<ViewStyle>
}

const BottomButtons = ({ children, bottomInset, style }: BottomButtonsProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Container style={[{ paddingBottom: bottomInset ? insets.bottom : 0 }, style]}>
      <Gradient
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        locations={[0.45, 1]}
        colors={
          theme.name === 'dark'
            ? [theme.bg.back2, colord(theme.bg.back2).alpha(0).toHex()]
            : [theme.bg.highlight, colord(theme.bg.highlight).alpha(0).toHex()]
        }
        pointerEvents="none"
        style={{ height: bottomInset ? '240%' : '160%' }}
      />
      {children}
    </Container>
  )
}

export default BottomButtons

const Container = styled.View`
  justify-content: center;
  align-items: flex-end;
  margin: ${VERTICAL_GAP * 2}px ${DEFAULT_MARGIN}px ${VERTICAL_GAP}px;
  gap: 20px;
`

const Gradient = styled(LinearGradient)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`
