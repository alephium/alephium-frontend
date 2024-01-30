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

import { Switch, SwitchProps } from 'react-native'
import { useTheme } from 'styled-components/native'

interface ToggleProps extends SwitchProps {
  onValueChange?: (value: boolean) => void
}

const Toggle = ({ onValueChange, ...props }: ToggleProps) => {
  const theme = useTheme()

  return (
    <Switch
      {...props}
      onValueChange={onValueChange}
      trackColor={{
        false: props.disabled ? theme.bg.back1 : theme.font.secondary,
        true: props.disabled ? theme.bg.back1 : theme.global.accent
      }}
      thumbColor={theme.name === 'light' ? theme.font.contrast : theme.font.primary}
    />
  )
}

export default Toggle
