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

import { Eye as EyeIcon, Settings2 as SettingsIcon, ShieldAlert as SecurityIcon } from 'lucide-react-native'
import { memo } from 'react'
import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { discreetModeChanged } from '../store/settingsSlice'

interface DashboardHeaderActionsProps {
  style?: StyleProp<ViewStyle>
}

const DashboardHeaderActions = ({ style }: DashboardHeaderActionsProps) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const toggleDiscreetMode = () => {
    dispatch(discreetModeChanged(!discreetMode))
  }

  return (
    <View style={style}>
      <Pressable onPress={toggleDiscreetMode}>
        <Icon>
          <EyeIcon size={24} color={theme.font.primary} />
        </Icon>
      </Pressable>
      <Pressable>
        <Icon>
          <SecurityIcon size={24} color={theme.font.primary} />
        </Icon>
      </Pressable>
      <Pressable>
        <Icon>
          <SettingsIcon size={24} color={theme.font.primary} />
        </Icon>
      </Pressable>
    </View>
  )
}

export default memo(styled(DashboardHeaderActions)`
  flex-direction: row;
  align-items: center;
`)

// TODO: Create standalone Icon component to allow us to define the size prop
const Icon = styled(View)`
  padding: 18px 12px;
`
