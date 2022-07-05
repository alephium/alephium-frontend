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

import { useNavigation } from '@react-navigation/native'
import { MoreVertical as DotsIcon } from 'lucide-react-native'
import { StyleProp, Text, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import Button from './buttons/Button'

interface WalletSwitchProps {
  style?: StyleProp<ViewStyle>
}

const WalletSwitch = ({ style }: WalletSwitchProps) => {
  const theme = useTheme()
  const navigation = useNavigation()
  const activeWallet = useAppSelector((state) => state.activeWallet)

  return (
    <Button style={style} variant="contrast" onPress={() => navigation.navigate('SwitchWalletScreen')}>
      {/* TODO: Figure out how to fix the position of the dots to the right, no matter the length of the wallet name */}
      <WalletName numberOfLines={1}>{activeWallet.name}</WalletName>
      <DotsIcon size={14} color={theme.font.primary} />
    </Button>
  )
}

export default styled(WalletSwitch)`
  width: 50%;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 12px;
  height: 40px;
`

const WalletName = styled(Text)`
  font-weight: 700;
`
