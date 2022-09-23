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

import { X } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useTheme } from 'styled-components/native'

import AppText from './AppText'
import Button from './buttons/Button'
import Numbered from './Numbered'

interface OrderedListInputProps {
  items: string[]
  onChange: (items: string[]) => void
}

const OrderedListInput = ({ items, onChange }: OrderedListInputProps) => {
  const theme = useTheme()
  const [choices, setChoices] = useState([...items])
  const [selected, setSelected] = useState<string[]>(new Array(items.length).fill(' '))

  const push = (index: number) => {
    const item = choices[index]
    selected[items.length - choices.length] = item
    choices.splice(index, 1)
    setChoices([...choices])
    setSelected([...selected])
  }

  const pop = () => {
    if (choices.length == items.length) return
    const item = selected[items.length - choices.length - 1]
    selected[items.length - choices.length - 1] = ' '
    choices.push(item)
    setChoices([...choices])
    setSelected([...selected])
  }

  return (
    <View style={{ flexDirection: 'row', paddingLeft: 32, paddingTop: 64, paddingRight: 32, paddingBottom: 32 }}>
      <ScrollView>
        {selected.map((item: string, index: number) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }} key={index}>
            <Numbered index={index + 1}>
              <AppText>{item}</AppText>
            </Numbered>
          </View>
        ))}
      </ScrollView>
      <View style={{ flexGrow: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          {choices.map((item: string, index: number) => (
            <Button
              key={index}
              title={item}
              style={{
                marginBottom: 12,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.font.primary
              }}
              variant="contrast"
              onPress={() => push(index)}
            />
          ))}
        </ScrollView>
        <View style={{ paddingTop: 16 }}>
          <Button title="Undo" icon={<X size={16} color={theme.bg.primary} />} onPress={() => pop()} />
        </View>
      </View>
    </View>
  )
}

export default OrderedListInput
