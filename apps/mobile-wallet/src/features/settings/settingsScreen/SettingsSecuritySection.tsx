import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { styled } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { getAutoLockLabel } from '~/features/auto-lock/utils'
import FundPasswordSettingsRow from '~/features/fund-password/FundPasswordSettingsRow'
import { openModal } from '~/features/modals/modalActions'
import { biometricsToggled, passwordRequirementToggled } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics, useBiometricsAuthGuard } from '~/hooks/useBiometrics'

const SettingsSecuritySection = () => {
  const { t } = useTranslation()

  return (
    <ScreenSection>
      <ScreenSectionTitle>{t('Security')}</ScreenSectionTitle>
      <BiometricsRecommendationMessage />
      <BiometricsSettingsRows />
      <FundPasswordSettingsRow />
      <AutoLockSettingsRow />
    </ScreenSection>
  )
}

export default SettingsSecuritySection

const BiometricsRecommendationMessage = () => {
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()
  const { t } = useTranslation()

  if (!deviceSupportsBiometrics || deviceHasEnrolledBiometrics) return null

  return (
    <BiometricsRecommendationBox type="accent">
      <AppText color="accent">
        {t(
          "Your device supports biometrics but none is enrolled. Enable them by adding a fingerprint or Face ID in your device's settings."
        )}
      </AppText>
    </BiometricsRecommendationBox>
  )
}

const BiometricsSettingsRows = () => {
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const biometricsRequiredForTransactions = useAppSelector((s) => s.settings.requireAuth)
  const { deviceHasEnrolledBiometrics } = useBiometrics()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleBiometricsAppAccessChange = (value: boolean) =>
    value || biometricsRequiredForTransactions
      ? toggleBiometricsAppAccess()
      : dispatch(openModal({ name: 'BiometricsWarningModal', props: { onConfirm: toggleBiometricsAppAccess } }))

  const handleBiometricsTransactionsChange = (value: boolean) =>
    value || biometricsRequiredForAppAccess
      ? toggleBiometricsTransactions()
      : dispatch(openModal({ name: 'BiometricsWarningModal', props: { onConfirm: toggleBiometricsTransactions } }))

  const toggleBiometricsAppAccess = () =>
    triggerBiometricsAuthGuard({
      settingsToCheck: 'appAccess',
      successCallback: () => dispatch(biometricsToggled())
    })

  const toggleBiometricsTransactions = () =>
    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () => dispatch(passwordRequirementToggled())
    })

  return (
    <>
      <Row
        title={t('App access')}
        subtitle={t(
          !deviceHasEnrolledBiometrics && Platform.OS === 'ios'
            ? 'Require device passcode to open app'
            : 'Require biometrics to open app'
        )}
      >
        <Toggle
          value={isBiometricsEnabled}
          onValueChange={handleBiometricsAppAccessChange}
          disabled={!deviceHasEnrolledBiometrics && Platform.OS === 'android'}
        />
      </Row>
      <Row
        title={t('Transactions')}
        subtitle={t(
          !deviceHasEnrolledBiometrics && Platform.OS === 'ios'
            ? 'Require device passcode to transact'
            : 'Require biometrics to transact'
        )}
      >
        <Toggle
          value={biometricsRequiredForTransactions}
          onValueChange={handleBiometricsTransactionsChange}
          disabled={!deviceHasEnrolledBiometrics && Platform.OS === 'android'}
        />
      </Row>
    </>
  )
}

const AutoLockSettingsRow = () => {
  const { t } = useTranslation()
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const openAutoLockOptionsModal = () => dispatch(openModal({ name: 'AutoLockOptionsModal' }))

  return (
    <Row
      title={t('Auto-lock')}
      subtitle={t('Amount of time before app locks')}
      isLast
      onPress={openAutoLockOptionsModal}
    >
      <AppText bold>{getAutoLockLabel(autoLockSeconds)}</AppText>
    </Row>
  )
}

const BiometricsRecommendationBox = styled(Surface)`
  padding: 20px;
`
