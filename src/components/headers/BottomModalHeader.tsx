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

import { StackHeaderProps } from '@react-navigation/stack'
import { ReactNode } from 'react'
import { View } from 'react-native'
import { useTheme } from 'styled-components/native'

import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'

interface BottomModalHeaderProps {
  title?: StackHeaderProps['options']['title']
  children?: ReactNode
}

export const bottomModalHeights = {
  pullTab: {
    container: 20,
    bar: 4
  }
}

const BottomModalHeader = ({ children, title }: BottomModalHeaderProps) => {
  const theme = useTheme()

  return (
    <View>
      <View
        style={{
          position: 'absolute',
          height: bottomModalHeights.pullTab.bar,
          width: '100%',
          alignItems: 'center'
        }}
      >
        <View style={{ width: 35, height: '100%', backgroundColor: theme.font.tertiary, borderRadius: 20 }} />
      </View>
      {title && (
        <ScreenSection>
          <BottomModalScreenTitle>{title}</BottomModalScreenTitle>
        </ScreenSection>
      )}
      {children && <View>{children}</View>}
    </View>
  )
}

export default BottomModalHeader
