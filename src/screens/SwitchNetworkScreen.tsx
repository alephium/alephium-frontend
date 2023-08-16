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
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { networkPresetSettings, persistSettings } from '~/persistent-storage/settings'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'
import { NetworkName, NetworkPreset } from '~/types/network'
import { NetworkSettings } from '~/types/settings'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SwitchNetworkScreen'>, ScrollScreenProps {}

const networkNames = Object.values(NetworkName)

const SwitchNetworkScreen = ({ navigation, ...props }: ScreenProps) => {
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const currentNetworkSettings = useAppSelector((s) => s.network.settings)
  const { control, handleSubmit } = useForm<NetworkSettings>({
    defaultValues: currentNetworkSettings
  })
  const dispatch = useAppDispatch()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetworkName === NetworkName.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetworkName)

  const handleNetworkItemPress = async (newNetworkName: NetworkPreset | NetworkName.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName === NetworkName.custom) {
      setShowCustomNetworkForm(true)
    } else {
      await persistSettings('network', networkPresetSettings[newNetworkName])
      dispatch(networkPresetSwitched(newNetworkName))

      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    }
  }

  const saveCustomNetwork = async (formData: NetworkSettings) => {
    await persistSettings('network', formData)
    dispatch(customNetworkSettingsSaved(formData))

    navigation.goBack()
  }

  return (
    <ScrollScreen {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Current network</BottomModalScreenTitle>
      </ScreenSection>
      <View>
        <ScreenSection>
          <BoxSurface>
            {networkNames.map((networkName) => (
              <RadioButtonRow
                key={networkName}
                title={capitalize(networkName)}
                onPress={() => handleNetworkItemPress(networkName)}
                isActive={networkName === selectedNetworkName}
              />
            ))}
          </BoxSurface>
        </ScreenSection>

        {showCustomNetworkForm && (
          <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
            <ScreenSection>
              <BoxSurface>
                <Controller
                  name="nodeHost"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Node host"
                      keyboardType="url"
                      textContentType="URL"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                  control={control}
                />
                <Controller
                  name="explorerApiHost"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Explorer API host"
                      keyboardType="url"
                      textContentType="URL"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                  control={control}
                />
                <Controller
                  name="explorerUrl"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Explorer URL"
                      keyboardType="url"
                      textContentType="URL"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                  control={control}
                />
              </BoxSurface>
              <ButtonStyled centered title="Save custom network" onPress={handleSubmit(saveCustomNetwork)} />
            </ScreenSection>
          </Animated.View>
        )}
      </View>
    </ScrollScreen>
  )
}

export default SwitchNetworkScreen

const ButtonStyled = styled(Button)`
  margin-top: 30px;
  margin-bottom: 20px;
`
