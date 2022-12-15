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
import { ScrollView } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import Input from '../components/inputs/Input'
import { BottomModalScreenTitle, ScreenSection } from '../components/layout/Screen'
import RadioButtonRow from '../components/RadioButtonRow'
import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeSettings } from '../storage/settings'
import { addressesFlushed, initializeAddressesFromStoredMetadata } from '../store/addressesSlice'
import { customNetworkSettingsStored, networkChanged } from '../store/networkSlice'
import { NetworkName, NetworkPreset } from '../types/network'
import { NetworkSettings } from '../types/settings'

type ScreenProps = StackScreenProps<RootStackParamList, 'SwitchNetworkScreen'>

const networkNames = Object.values(NetworkName)

const SwitchNetworkScreen = ({ navigation }: ScreenProps) => {
  const currentNetwork = useAppSelector((state) => state.network)
  const dispatch = useAppDispatch()

  const [showCustomNetworkForm, setShowCustomNetworkForm] = useState(currentNetwork.name === NetworkName.custom)
  const [selectedNetworkName, setSelectedNetworkName] = useState(currentNetwork.name)
  const [loading, setLoading] = useState(false)

  const { control, handleSubmit } = useForm<NetworkSettings>({
    defaultValues: currentNetwork.settings
  })

  const handleNetworkItemPress = (newNetworkName: NetworkPreset | NetworkName.custom) => {
    setSelectedNetworkName(newNetworkName)

    if (newNetworkName !== NetworkName.custom) {
      dispatch(networkChanged(newNetworkName))
      // TODO: Update data instead of flushing and re-initializing
      dispatch(addressesFlushed())
      dispatch(initializeAddressesFromStoredMetadata())
      if (showCustomNetworkForm) setShowCustomNetworkForm(false)
    } else {
      setShowCustomNetworkForm(true)
    }
  }

  const saveCustomNetwork = async (formData: NetworkSettings) => {
    setLoading(true)

    await storeSettings('network', formData)
    dispatch(customNetworkSettingsStored(formData))

    setLoading(false)
    navigation.goBack()
  }

  return (
    <>
      <ScreenSection>
        <BottomModalScreenTitle>Current network</BottomModalScreenTitle>
      </ScreenSection>
      <ScrollView>
        <ScreenSection fill>
          {networkNames.map((networkName, index) => (
            <RadioButtonRow
              key={networkName}
              title={capitalize(networkName)}
              onPress={() => handleNetworkItemPress(networkName)}
              isFirst={index === 0}
              isLast={index === networkNames.length - 1}
              isActive={networkName === selectedNetworkName}
            />
          ))}
        </ScreenSection>
        {showCustomNetworkForm && (
          <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
            <ScreenSection>
              <Controller
                name="nodeHost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Node host"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    isTopRounded
                    hasBottomBorder
                  />
                )}
                control={control}
              />
              <Controller
                name="explorerApiHost"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Explorer API host"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    hasBottomBorder
                  />
                )}
                control={control}
              />
              <Controller
                name="explorerUrl"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Explorer URL" value={value} onChangeText={onChange} onBlur={onBlur} isBottomRounded />
                )}
                control={control}
              />
              <ButtonStyled centered title="Save custom network" onPress={handleSubmit(saveCustomNetwork)} />
            </ScreenSection>
          </Animated.View>
        )}
      </ScrollView>
      <SpinnerModal isActive={loading} />
    </>
  )
}

export default SwitchNetworkScreen

const ButtonStyled = styled(Button)`
  margin-top: 30px;
  margin-bottom: 20px;
`
