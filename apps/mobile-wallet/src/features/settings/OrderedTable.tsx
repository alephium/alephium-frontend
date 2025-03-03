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
