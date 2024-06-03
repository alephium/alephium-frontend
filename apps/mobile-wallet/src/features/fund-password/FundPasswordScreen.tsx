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

import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useTheme } from 'styled-components'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { deleteFundPassword, storeFundPassword } from '~/features/fund-password/fundPasswordStorage'
import useFundPassword from '~/features/fund-password/useFundPassword'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { useAppDispatch } from '~/hooks/redux'
import usePassword from '~/hooks/usePassword'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { fundPasswordUseToggled } from '~/store/settingsSlice'
import { showToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface FundPasswordScreenProps
  extends StackScreenProps<RootStackParamList, 'FundPasswordScreen'>,
    ScrollScreenProps {}

const FundPasswordScreen = ({ navigation, ...props }: FundPasswordScreenProps) => {
  const cameFromBackupScreen = props.route.params.origin === 'backup'
  const isSettingNewPassword = props.route.params.newPassword
  const theme = useTheme()
  const { setHeaderOptions } = useHeaderContext()
  const currentFundPassword = useFundPassword()
  const dispatch = useAppDispatch()
  const { fundPasswordModal, triggerFundPasswordAuthGuard } = useFundPasswordGuard()

  const [isEditingPassword, setIsEditingPassword] = useState<boolean>()
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const {
    password: confirmedNewPassword,
    handlePasswordChange: handleConfirmedNewPasswordChange,
    isPasswordCorrect: isEditingPasswordConfirmed,
    error: newPasswordError
  } = usePassword({ correctPassword: newPassword, errorMessage: "New passwords don't match", isValidation: true })

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => null
      })
    }, [setHeaderOptions])
  )

  useEffect(() => {
    if (currentFundPassword) setPassword(currentFundPassword)
  }, [currentFundPassword])

  const handleSavePress = async () => {
    await storeFundPassword(newPassword || password)
    dispatch(fundPasswordUseToggled(true))
    showToast({
      text1: 'Saved!',
      text2: newPassword ? 'Fund password was updated.' : 'Fund password was set up.',
      type: 'success'
    })
    cameFromBackupScreen ? resetNavigation(navigation) : navigation.goBack()
    sendAnalytics({
      event: newPassword ? 'Updated fund password' : 'Created fund password',
      props: {
        origin: props.route.params.origin
      }
    })
  }

  const handlePasswordEdit = () => {
    triggerFundPasswordAuthGuard({
      successCallback: () => {
        setIsEditingPassword(true)
      }
    })
  }

  const handleDeletePress = async () => {
    triggerFundPasswordAuthGuard({
      successCallback: () => {
        showAlert('Delete fund password', async () => {
          await deleteFundPassword()
          dispatch(fundPasswordUseToggled(false))
          showToast({
            text1: 'Deleted',
            text2: 'Fund password was deleted.',
            type: 'info'
          })
          navigation.goBack()
          sendAnalytics({ event: 'Deleted fund password', props: { origin: props.route.params.origin } })
        })
      }
    })
  }

  const handleSkipPress = async () => {
    showAlert("I'll do it later", () => {
      resetNavigation(navigation)
      sendAnalytics({ event: 'Skipped fund password' })
    })
  }

  const showAlert = (text: string, onPress: () => void) => {
    Alert.alert('Are you sure?', 'To enhance your security it is recommended to use a fund password.', [
      { text: 'Cancel' },
      { text, onPress }
    ])
  }

  const screenIntro = isEditingPassword
    ? 'You can set a new password below. This password will be required for critical operations involving the safety of your funds and cannot be recovered.'
    : 'The Fund Password acts as an additional authentication layer for critical operations involving the safety of your funds such as revealing your secret recovery phrase or sending funds.'

  return (
    <ScrollScreen
      verticalGap
      fill
      screenTitle="Fund password"
      screenIntro={screenIntro}
      headerOptions={{ type: cameFromBackupScreen ? 'default' : 'stack' }}
      {...props}
    >
      {isEditingPassword || isSettingNewPassword ? (
        <>
          <ScreenSection fill verticalGap>
            <Input
              label={isEditingPassword ? 'New fund password' : 'Fund password'}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Input
              label={isEditingPassword ? 'Confirm new fund password' : 'Confirm fund password'}
              value={confirmedNewPassword}
              onChangeText={handleConfirmedNewPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              error={newPasswordError}
              returnKeyType="done"
              blurOnSubmit={false}
            />
          </ScreenSection>
          <ScreenSection>
            <ButtonStack>
              {cameFromBackupScreen && <Button title="Skip" onPress={handleSkipPress} flex />}
              <Button
                variant="highlight"
                title="Save"
                onPress={handleSavePress}
                disabled={!isEditingPasswordConfirmed}
                flex
              />
            </ButtonStack>
          </ScreenSection>
        </>
      ) : (
        <ScreenSection>
          <BoxSurface>
            <Row title="Edit password" onPress={handlePasswordEdit} titleColor={theme.global.accent}>
              <Ionicons name="pencil" size={18} color={theme.global.accent} />
            </Row>
            <Row title="Disable password" onPress={handleDeletePress} titleColor={theme.global.alert} isLast>
              <Ionicons name="close" size={18} color={theme.global.alert} />
            </Row>
          </BoxSurface>
        </ScreenSection>
      )}

      {fundPasswordModal}
    </ScrollScreen>
  )
}

export default FundPasswordScreen
