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

import Icon from '@expo/vector-icons/Feather'
import { PressableProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

interface NumberKeyboardProps {
  onPress: (value: NumberKeyboardKey) => void
}

export type NumberKeyboardKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0' | 'delete'

const NumberKeyboard = ({ onPress }: NumberKeyboardProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  const keyButtonStyle: PressableProps['style'] = ({ pressed }) => [
    {
      backgroundColor: pressed ? theme.bg.highlight : 'transparent'
    }
  ]

  const renderRow = (values: Array<NumberKeyboardKey | ''>) => (
    <KeyboardRow>
      {values.map((value) => (
        <KeyboardButton
          key={value}
          onPressIn={() => onPress(value as NumberKeyboardKey)}
          disabled={!value}
          style={keyButtonStyle}
        >
          {value === 'delete' ? (
            <Icon name="delete" size={23} color={theme.font.primary} />
          ) : (
            <KeyText>{value}</KeyText>
          )}
        </KeyboardButton>
      ))}
    </KeyboardRow>
  )

  return (
    <KeyboardContainer style={{ paddingBottom: insets.bottom }}>
      {renderRow(['1', '2', '3'])}
      {renderRow(['4', '5', '6'])}
      {renderRow(['7', '8', '9'])}
      {renderRow(['', '0', 'delete'])}
    </KeyboardContainer>
  )
}

export default NumberKeyboard

const KeyboardContainer = styled.View`
  width: 100%;
  border-top-color: ${({ theme }) => theme.border.secondary};
  border-top-width: 1px;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const KeyboardRow = styled.View`
  flex-direction: row;
  height: 70px;
`

const KeyboardButton = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
`

const KeyText = styled(AppText)`
  font-size: 23px;
`
