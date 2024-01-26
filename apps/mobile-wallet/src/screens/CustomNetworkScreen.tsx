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

import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { sendAnalytics } from '~/analytics'
import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistSettings } from '~/persistent-storage/settings'
import { customNetworkSettingsSaved } from '~/store/networkSlice'
import { NetworkSettings } from '~/types/settings'
import { showExceptionToast } from '~/utils/layout'

interface CustomNetworkScreenProps
  extends StackScreenProps<RootStackParamList, 'CustomNetworkScreen'>,
    ScrollScreenProps {}

const CustomNetworkScreen = ({ navigation }: CustomNetworkScreenProps) => {
  const currentNetworkSettings = useAppSelector((s) => s.network.settings)
  const { control, handleSubmit } = useForm<NetworkSettings>({
    defaultValues: currentNetworkSettings
  })
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(false)

  const saveCustomNetwork = async (formData: NetworkSettings) => {
    setLoading(true)

    try {
      await persistSettings('network', formData)
      dispatch(customNetworkSettingsSaved(formData))

      sendAnalytics('Saved custom network settings')
    } catch (e) {
      showExceptionToast(e, 'Could not save custom network settings')

      sendAnalytics('Error', { message: 'Could not save custom network settings' })
    }

    setLoading(false)

    navigation.goBack()
  }

  return (
    <>
      <ScrollScreen
        usesKeyboard
        fill
        headerOptions={{
          type: 'stack',
          headerTitle: 'Custom network',
          headerRight: () => (
            <ContinueButton title="Save" onPress={handleSubmit(saveCustomNetwork)} iconProps={undefined} />
          )
        }}
      >
        <ScreenSection verticalGap>
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
        </ScreenSection>
      </ScrollScreen>
      <SpinnerModal isActive={loading} text="Saving network settings..." />
    </>
  )
}

export default CustomNetworkScreen
