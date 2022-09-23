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
import { View } from 'react-native'

import AppText from './AppText'

interface NumberedProps {
  index: number
  children: ReactNode
}

const Numbered = ({ index, children }: NumberedProps) => (
  <View
    style={{
      paddingRight: index % 2 == 0 ? 20 : 0,
      marginBottom: 10,
      flexDirection: 'row'
    }}
  >
    <View style={{ marginRight: 5, width: 15 }}>
      <AppText style={{ fontSize: 10, textAlign: 'right' }}>{index}</AppText>
    </View>
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: 'black',
        paddingBottom: 5,
        width: 100
      }}
    >
      {children}
    </View>
  </View>
)

export default Numbered
