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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { deleteFundPassword, storeFundPassword } from '~/features/fund-password/fundPasswordStorage'
import useFundPassword from '~/features/fund-password/useFundPassword'
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
  const { setHeaderOptions } = useHeaderContext()
  const currentFundPassword = useFundPassword()
  const dispatch = useAppDispatch()

  const [password, setPassword] = useState('')
  const {
    password: confirmedPassword,
    handlePasswordChange: handleConfirmedPasswordChange,
    isPasswordCorrect: isCurrentPasswordConfirmed,
    error
  } = usePassword(password, !currentFundPassword ? "Passwords don't match" : undefined)

  const [newPassword, setNewPassword] = useState('')
  const {
    password: confirmedNewPassword,
    handlePasswordChange: handleConfirmedNewPasswordChange,
    isPasswordCorrect: isNewPasswordConfirmed,
    error: newPasswordError
  } = usePassword(newPassword, "New passwords don't match")

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

  const handleDeletePress = async () => {
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

  return (
    <ScrollScreen
      verticalGap
      fill
      screenTitle="Fund password"
      screenIntro="It acts as an additional authentication layer for critical operations involving the safety of your funds such as revealing your secret recovery phrase or sending funds."
      headerOptions={{ type: cameFromBackupScreen ? 'default' : 'stack' }}
      {...props}
    >
      {!currentFundPassword ? (
        <>
          <ScreenSection fill verticalGap>
            <Input
              label="Fund password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Input
              label="Confirm fund password"
              value={confirmedPassword}
              onChangeText={handleConfirmedPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              error={error}
              returnKeyType="done"
              blurOnSubmit={false}
              editable={password.length > 0}
            />
          </ScreenSection>
          <ScreenSection>
            <ButtonsRow>
              {cameFromBackupScreen && <Button title="Skip" onPress={handleSkipPress} flex />}
              <Button
                variant="highlight"
                title="Save"
                onPress={handleSavePress}
                disabled={!isCurrentPasswordConfirmed}
                flex
              />
            </ButtonsRow>
          </ScreenSection>
        </>
      ) : (
        <>
          <ScreenSection verticalGap>
            <AppText>Confirm current fund password to make changes.</AppText>
            <Input
              label="Current fund password"
              value={confirmedPassword}
              onChangeText={handleConfirmedPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              error={error}
              returnKeyType="done"
              blurOnSubmit={false}
            />
          </ScreenSection>
          {currentFundPassword && isCurrentPasswordConfirmed && (
            <>
              <ScreenSection fill verticalGap>
                <Input
                  label="New fund password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <Input
                  label="Confirm new fund password"
                  value={confirmedNewPassword}
                  onChangeText={handleConfirmedNewPasswordChange}
                  secureTextEntry
                  autoCapitalize="none"
                  error={newPasswordError}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  editable={password.length > 0}
                />
              </ScreenSection>
              <ScreenSection>
                <ButtonsRow>
                  <Button
                    variant="alert"
                    title="Delete"
                    onPress={handleDeletePress}
                    disabled={!isCurrentPasswordConfirmed}
                    flex
                  />
                  <Button
                    variant="highlight"
                    title="Save"
                    onPress={handleSavePress}
                    disabled={!isNewPasswordConfirmed}
                    flex
                  />
                </ButtonsRow>
              </ScreenSection>
            </>
          )}
        </>
      )}
    </ScrollScreen>
  )
}

export default FundPasswordScreen
