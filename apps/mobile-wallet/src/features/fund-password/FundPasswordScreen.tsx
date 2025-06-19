import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useTheme } from 'styled-components'

import { sendAnalytics } from '~/analytics'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { fundPasswordUseToggled } from '~/features/fund-password/fundPasswordActions'
import { deleteFundPassword, storeFundPassword } from '~/features/fund-password/fundPasswordStorage'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import usePassword from '~/hooks/usePassword'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showExceptionToast, showToast } from '~/utils/layout'

interface FundPasswordScreenProps
  extends StackScreenProps<RootStackParamList, 'FundPasswordScreen'>,
    ScrollScreenProps {}

const FundPasswordScreen = ({ navigation, ...props }: FundPasswordScreenProps) => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const theme = useTheme()
  const { setHeaderOptions } = useHeaderContext()
  const dispatch = useAppDispatch()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { t } = useTranslation()

  const [isEditingPassword, setIsEditingPassword] = useState<boolean>()
  const [newPassword, setNewPassword] = useState('')
  const [confirmedSecretRecoveryPhrase, setConfirmedSecretRecoveryPhrase] = useState(false)
  const {
    password: confirmedNewPassword,
    handlePasswordChange: handleConfirmedNewPasswordChange,
    isPasswordCorrect: isEditingPasswordConfirmed,
    error: newPasswordError
  } = usePassword({ correctPassword: newPassword, errorMessage: t("New passwords don't match"), isValidation: true })

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => null
      })
    }, [setHeaderOptions])
  )

  const handleSavePress = () =>
    showConfirmDialog(async () => {
      try {
        await storeFundPassword(newPassword)
        dispatch(fundPasswordUseToggled(true))
        showToast({
          text1: t('Saved!'),
          text2: newPassword ? t('Fund password was updated.') : t('Fund password was set up.'),
          type: 'success'
        })

        navigation.goBack()

        sendAnalytics({
          event: newPassword ? t('Updated fund password') : t('Created fund password')
        })
      } catch (error) {
        showExceptionToast(error, t('Could not save fund password.'))
      }
    })

  const showConfirmDialog = (onPress: () => void) => {
    Alert.alert(
      t('Save fund password'),
      t(
        'If you lose access to your fund password, the only way to recover your funds is by using your secret recovery phrase.'
      ),
      [{ text: t('Cancel') }, { text: t('Save'), onPress }]
    )
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
        showWarningDialog(t('Delete fund password'), async () => {
          await deleteFundPassword()
          dispatch(fundPasswordUseToggled(false))
          showToast({
            text1: t('Deleted'),
            text2: t('Fund password was deleted.'),
            type: 'info'
          })
          navigation.goBack()
          sendAnalytics({ event: 'Deleted fund password' })
        })
      }
    })
  }

  const showWarningDialog = (text: string, onPress: () => void) => {
    Alert.alert(t('Are you sure?'), t('To enhance your security it is recommended to use a fund password.'), [
      { text: t('Cancel') },
      { text, onPress }
    ])
  }

  const screenIntro = isEditingPassword
    ? t(
        'You can set a new password below. This password will be required for critical operations involving the safety of your funds and cannot be recovered.'
      )
    : t(
        'The fund password acts as an additional authentication layer for critical operations involving the safety of your funds such as revealing your secret recovery phrase or sending funds.'
      )

  const isContinueButtonActive = confirmedSecretRecoveryPhrase && isEditingPasswordConfirmed

  return (
    <ScrollScreen
      verticalGap
      fill
      hasKeyboard
      contentPaddingTop
      screenTitle={t('Fund password')}
      screenIntro={screenIntro}
      headerOptions={{ type: 'stack' }}
      {...props}
    >
      {isEditingPassword || !isUsingFundPassword ? (
        <>
          <ScreenSection fill verticalGap>
            <Input
              label={isEditingPassword ? t('New fund password') : t('Fund password')}
              defaultValue={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              blurOnSubmit={false}
            />
            <Input
              label={isEditingPassword ? t('Confirm new fund password') : t('Confirm fund password')}
              defaultValue={confirmedNewPassword}
              onChangeText={handleConfirmedNewPasswordChange}
              secureTextEntry
              autoCapitalize="none"
              error={newPasswordError}
              blurOnSubmit={false}
              onSubmitEditing={isContinueButtonActive ? handleSavePress : undefined}
            />
            <Row
              title={t('Secret recovery phrase backup')}
              subtitle={t('I confirm that I have saved my secret recovery phrase securely.')}
              isLast
            >
              <Toggle value={confirmedSecretRecoveryPhrase} onValueChange={setConfirmedSecretRecoveryPhrase} />
            </Row>
          </ScreenSection>
          <BottomButtons>
            <Button
              variant="highlight"
              title={t('Save')}
              onPress={handleSavePress}
              disabled={!isContinueButtonActive}
              flex
            />
          </BottomButtons>
        </>
      ) : (
        <ScreenSection>
          <Surface>
            <Row title={t('Edit password')} onPress={handlePasswordEdit} titleColor={theme.global.accent}>
              <Ionicons name="pencil" size={18} color={theme.global.accent} />
            </Row>
            <Row title={t('Disable password')} onPress={handleDeletePress} titleColor={theme.global.alert} isLast>
              <Ionicons name="close" size={18} color={theme.global.alert} />
            </Row>
          </Surface>
        </ScreenSection>
      )}
    </ScrollScreen>
  )
}

export default FundPasswordScreen
