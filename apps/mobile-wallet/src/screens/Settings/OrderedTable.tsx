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

import { chunk } from 'lodash'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'

interface OrderedTableProps {
  items: string[]
  splitWhenAt?: number
  style?: StyleProp<ViewStyle>
}

const OrderedTable = ({ items, splitWhenAt = 12, style }: OrderedTableProps) => {
  const columns = chunk(items, splitWhenAt)

  return (
    <View style={style}>
      {columns.map((items, columnIndex) => (
        <Column key={columnIndex}>
          {items.map((item: string, itemIndex: number) => (
            <NumberedRow key={itemIndex}>
              <IndexNumber>{columnIndex * splitWhenAt + (itemIndex + 1)}.</IndexNumber>
              <MnemonicWord>{item}</MnemonicWord>
            </NumberedRow>
          ))}
        </Column>
      ))}
    </View>
  )
}

export default styled(OrderedTable)`
  flex-direction: row;
  width: 80%;
  justify-content: space-between;
  margin-top: 20px;
`

const Column = styled.View``

const NumberedRow = styled.View`
  flex-direction: row;
  margin-bottom: 15px;
`

const IndexNumber = styled(AppText)`
  font-size: 16px;
  text-align: right;
  width: 36px;
  margin-right: 10px;
`

const MnemonicWord = styled(AppText)`
  font-size: 16px;
  font-weight: 600;
`
