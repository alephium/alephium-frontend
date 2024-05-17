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

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppDispatch } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteFundingPassword, getFundingPassword, storeFundingPassword } from '~/persistent-storage/fundingPassword'
import { fundingPasswordUseToggled } from '~/store/settingsSlice'
import { showToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface FundingPasswordScreenProps
  extends StackScreenProps<RootStackParamList, 'FundingPasswordScreen'>,
    ScrollScreenProps {}

const FundingPasswordScreen = ({ navigation, ...props }: FundingPasswordScreenProps) => {
  const cameFromBackupScreen = props.route.params.origin === 'backup'
  const { setHeaderOptions } = useHeaderContext()
  const { data: currentFundingPassword } = useAsyncData(getFundingPassword)
  const dispatch = useAppDispatch()

  const [password, setPassword] = useState('')
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [error, setError] = useState<string>()

  const [newPassword, setNewPassword] = useState('')
  const [confirmedNewPassword, setConfirmedNewPassword] = useState('')
  const [newPasswordError, setNewPasswordError] = useState<string>()

  const isCurrentPasswordConfirmed = !!password && !!confirmedPassword && confirmedPassword === password
  const isNewPasswordConfirmed = !!newPassword && !!confirmedNewPassword && newPassword === confirmedNewPassword

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => null
      })
    }, [setHeaderOptions])
  )

  useEffect(() => {
    if (currentFundingPassword) setPassword(currentFundingPassword)
  }, [currentFundingPassword])

  const handleConfirmedPasswordChangeText = (text: string) => {
    setConfirmedPassword(text)

    if ((error === undefined && text.length === password.length) || error !== undefined) {
      setError(text !== password ? "Passwords don't match" : '')
    }
  }

  const handleConfirmedNewPasswordChangeText = (text: string) => {
    setConfirmedNewPassword(text)

    if ((newPasswordError === undefined && text.length === newPassword.length) || newPasswordError !== undefined) {
      setNewPasswordError(text !== newPassword ? "New passwords don't match" : '')
    }
  }

  const handleSavePress = async () => {
    await storeFundingPassword(newPassword || password)
    dispatch(fundingPasswordUseToggled(true))
    showToast({
      text1: 'Saved!',
      text2: newPassword ? 'Funding password was updated.' : 'Funding password was set up.',
      type: 'success'
    })

    cameFromBackupScreen ? resetNavigation(navigation) : navigation.goBack()
  }

  const handleDeletePress = async () => {
    showAlert('Delete funding password', async () => {
      await deleteFundingPassword()
      dispatch(fundingPasswordUseToggled(false))
      showToast({
        text1: 'Deleted',
        text2: 'Funding password was deleted.',
        type: 'info'
      })
      navigation.goBack()
    })
  }

  const handleSkipPress = async () => {
    showAlert("I'll do it later", () => resetNavigation(navigation))
  }

  const showAlert = (text: string, onPress: () => void) => {
    Alert.alert('Are you sure?', 'To enhance your security it is recommended to use a funding password.', [
      { text: 'Cancel' },
      { text, onPress }
    ])
  }

  return (
    <ScrollScreen
      verticalGap
      fill
      screenTitle="Funding password"
      screenIntro="It acts as an additional authentication layer before funds leave your wallet."
      headerOptions={{ type: cameFromBackupScreen ? 'default' : 'stack' }}
      {...props}
    >
      {!currentFundingPassword ? (
        <>
          <ScreenSection fill verticalGap>
            <Input
              label="Funding password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <Input
              label="Confirm funding password"
              value={confirmedPassword}
              onChangeText={handleConfirmedPasswordChangeText}
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
            <AppText>Confirm current funding password to make changes.</AppText>
            <Input
              label="Current funding password"
              value={confirmedPassword}
              onChangeText={handleConfirmedPasswordChangeText}
              secureTextEntry
              autoCapitalize="none"
              error={error}
              returnKeyType="done"
              blurOnSubmit={false}
            />
          </ScreenSection>
          {currentFundingPassword && isCurrentPasswordConfirmed && (
            <>
              <ScreenSection fill verticalGap>
                <Input
                  label="New funding password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                <Input
                  label="Confirm new funding password"
                  value={confirmedNewPassword}
                  onChangeText={handleConfirmedNewPasswordChangeText}
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

export default FundingPasswordScreen
