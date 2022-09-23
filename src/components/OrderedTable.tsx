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

import AppText from './AppText'
import Numbered from './Numbered'

interface OrderedTableProps {
  items: string[]
  splitWhenAt?: number
}

const OrderedTable = ({ items, splitWhenAt = 12 }: OrderedTableProps) => {
  const chunks: string[][] = items.reduce(
    (chunks: string[][], item: string, index: number) => {
      const chunk: string[] = chunks[chunks.length - 1]
      chunk.push(item)

      if ((index + 1) % splitWhenAt === 0) {
        chunks.push([])
      }

      return chunks
    },
    [[]]
  )

  return (
    <View style={{ flexDirection: 'row' }}>
      {chunks.map((items, index1) => (
        <View key={index1}>
          {items.map((item: string, index2: number) => (
            <Numbered key={index2} index={index1 * splitWhenAt + (index2 + 1)}>
              <AppText>{item}</AppText>
            </Numbered>
          ))}
        </View>
      ))}
    </View>
  )
}

export default OrderedTable
