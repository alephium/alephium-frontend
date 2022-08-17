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

import { StackScreenProps } from '@react-navigation/stack'
import { capitalize } from 'lodash'
import { useState } from 'react'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import Input from '../components/inputs/Input'
import Screen from '../components/layout/Screen'
import RadioButtonRow from '../components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { networkChanged, networkSettingsChanged } from '../store/networkSlice'
import { NetworkName, NetworkPreset } from '../types/network'

type ScreenProps = StackScreenProps<RootStackParamList, 'SwitchNetworkScreen'>

const networkNames = Object.values(NetworkName)

const SwitchNetworkScreen = ({ navigation }: ScreenProps) => {
  const currentNetworkName = useAppSelector((state) => state.network.name)
  const dispatch = useAppDispatch()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkName.custom)
  const [nodeHost, setNodeHost] = useState('')
  const [explorerApiHost, setExplorerApiHost] = useState('')
  const [explorerUrl, setExplorerUrl] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetworkName)

  const handleNetworkItemPress = (newNetworkName: NetworkPreset | NetworkName.custom) => {
    setSelectedNetwork(newNetworkName)

    if (newNetworkName !== NetworkName.custom) {
      dispatch(networkChanged(newNetworkName))
      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    } else {
      setShowCustomNetworkForm(true)
    }
  }

  const saveCustomNetwork = () => {
    dispatch(
      networkSettingsChanged({
        nodeHost,
        explorerApiHost,
        explorerUrl
      })
    )

    navigation.goBack()
  }

  return (
    <Screen>
      <ScreenSection>
        <Title>Current network</Title>
      </ScreenSection>
      <ScreenSection fill>
        {networkNames.map((networkName, index) => (
          <RadioButtonRow
            key={networkName}
            title={capitalize(networkName)}
            onPress={() => handleNetworkItemPress(networkName)}
            isFirst={index === 0}
            isLast={index === networkNames.length - 1}
            isActive={networkName === selectedNetwork}
          />
        ))}
      </ScreenSection>
      {showCustomNetworkForm && (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
          <ScreenSection>
            <Input value={nodeHost} onChangeText={setNodeHost} label="Node host" isTopRounded hasBottomBorder />
            <Input
              value={explorerApiHost}
              onChangeText={setExplorerApiHost}
              label="Explorer API host"
              hasBottomBorder
            />
            <Input value={explorerUrl} onChangeText={setExplorerUrl} label="Explorer URL" isBottomRounded />
            <ButtonStyled centered title="Save custom network" onPress={saveCustomNetwork} />
          </ScreenSection>
        </Animated.View>
      )}
    </Screen>
  )
}

export default SwitchNetworkScreen

const Title = styled.Text`
  font-weight: 600;
  font-size: 26px;
`

const ScreenSection = styled.View<{ fill?: boolean }>`
  padding: 29px 20px;

  ${({ fill }) => fill && 'flex: 1;'}
`

const ButtonStyled = styled(Button)`
  margin-top: 30px;
`
