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
import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import Row from '~/components/Row'
import LinkToWeb from '~/components/text/LinkToWeb'
import Toggle from '~/components/Toggle'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { getAutoLockLabel } from '~/features/auto-lock/utils'
import FundPasswordSettingsRow from '~/features/fund-password/FundPasswordSettingsRow'
import { languageOptions } from '~/features/localization/languages'
import { openModal } from '~/features/modals/modalActions'
import {
  analyticsToggled,
  biometricsToggled,
  discreetModeToggled,
  passwordRequirementToggled,
  themeChanged,
  walletConnectToggled
} from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics, useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { resetNavigation } from '~/utils/navigation'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SettingsScreen'>, ScrollScreenProps {}

const SettingsScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const { t } = useTranslation()
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const biometricsRequiredForTransactions = useAppSelector((s) => s.settings.requireAuth)
  const currentTheme = useAppSelector((s) => s.settings.theme)
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const language = useAppSelector((s) => s.settings.language)
  const analytics = useAppSelector((s) => s.settings.analytics)
  const walletName = useAppSelector((s) => s.wallet.name)
  const { resetWalletConnectClientInitializationAttempts, resetWalletConnectStorage } = useWalletConnectContext()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const [isThemeSwitchOverlayVisible, setIsThemeSwitchOverlayVisible] = useState(false)
  const [lastToggledBiometricsSetting, setLastToggledBiometricsSetting] = useState<
    'appAccess' | 'transactions' | undefined
  >()

  const openLanguageSelectModal = () => dispatch(openModal({ name: 'LanguageSelectModal' }))

  const openCurrencySelectModal = () => dispatch(openModal({ name: 'CurrencySelectModal' }))

  const openNetworkModal = () =>
    dispatch(
      openModal({
        name: 'SwitchNetworkModal',
        props: { onCustomNetworkPress: () => navigation.navigate('CustomNetworkScreen') }
      })
    )

  const openBiometricsWarningModal = () =>
    dispatch(openModal({ name: 'BiometricsWarningModal', props: { onConfirm: handleDisableBiometricsPress } }))

  const openAutoLockOptionsModal = () => dispatch(openModal({ name: 'AutoLockOptionsModal' }))

  const openEditWalletNameModal = () => dispatch(openModal({ name: 'EditWalletNameModal' }))

  const openSafePlaceWarningModal = () => dispatch(openModal({ name: 'SafePlaceWarningModal' }))

  const handleBiometricsAppAccessChange = (value: boolean) => {
    if (value || biometricsRequiredForTransactions) {
      toggleBiometricsAppAccess()
    } else {
      setLastToggledBiometricsSetting('appAccess')
      openBiometricsWarningModal()
    }
  }

  const handleBiometricsTransactionsChange = (value: boolean) => {
    if (value || biometricsRequiredForAppAccess) {
      toggleBiometricsTransactions()
    } else {
      setLastToggledBiometricsSetting('transactions')
      openBiometricsWarningModal()
    }
  }

  const toggleBiometricsAppAccess = async () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'appAccess',
      successCallback: () => dispatch(biometricsToggled())
    })
  }

  const toggleBiometricsTransactions = () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () => dispatch(passwordRequirementToggled())
    })
  }

  const handleDisableBiometricsPress = () => {
    lastToggledBiometricsSetting === 'appAccess' ? toggleBiometricsAppAccess() : toggleBiometricsTransactions()
  }

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const toggleTheme = (value: boolean) => {
    setIsThemeSwitchOverlayVisible(true)

    setTimeout(() => {
      dispatch(themeChanged(value ? 'dark' : 'light'))
      setIsThemeSwitchOverlayVisible(false)
    }, 500)
  }

  const toggleAnalytics = () => dispatch(analyticsToggled())

  const toggleWalletConnect = () => dispatch(walletConnectToggled())

  const handleDeleteButtonPress = () => {
    dispatch(
      openModal({ name: 'WalletDeleteModal', props: { onDelete: () => resetNavigation(navigation, 'LandingScreen') } })
    )
  }

  const handleWalletConnectEnablePress = () => {
    if (!isWalletConnectEnabled) {
      Alert.alert(
        t('Enabling experimental feature'),
        t('The WalletConnect feature is experimental, use it at your own risk.'),
        [
          { text: t('Cancel') },
          {
            text: t('I understand'),
            onPress: () => {
              toggleWalletConnect()
              resetWalletConnectClientInitializationAttempts()
            }
          }
        ]
      )
    } else {
      resetWalletConnectStorage()
      toggleWalletConnect()
    }
  }

  return (
    <>
      <ScrollScreen
        verticalGap
        screenTitle={t('Settings')}
        headerOptions={{ type: 'stack' }}
        contentPaddingTop
        {...props}
      >
        <ScreenSection>
          <ScreenSectionTitle>{t('General')}</ScreenSectionTitle>

          <Row onPress={openLanguageSelectModal} title="Language">
            <AppText bold>{languageOptions.find((l) => l.value === language)?.label}</AppText>
          </Row>
          <Row onPress={openCurrencySelectModal} title={t('Currency')}>
            <AppText bold>{currentCurrency}</AppText>
          </Row>
          <Row title={t('Current network')} onPress={openNetworkModal}>
            <AppText bold>{capitalize(currentNetworkName)}</AppText>
          </Row>
          <Row title={t('Discreet mode')} subtitle={t('Hide all amounts')}>
            <Toggle value={discreetMode} onValueChange={toggleDiscreetMode} />
          </Row>

          <Row title={t('Use dark theme')} subtitle={t("Try it, it's nice")}>
            <Toggle value={currentTheme === 'dark'} onValueChange={toggleTheme} />
          </Row>
          <Row title={t('Analytics')} subtitle={t('Help us improve your experience!')} isLast>
            <Toggle value={analytics} onValueChange={toggleAnalytics} />
          </Row>
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>{t('Security')}</ScreenSectionTitle>
          {deviceSupportsBiometrics && !deviceHasEnrolledBiometrics && (
            <BiometricsRecommendationBox type="accent">
              <AppText color="accent">
                {t(
                  "Your device supports biometrics but none is enrolled. Enable them by adding a fingerprint or Face ID in your device's settings."
                )}
              </AppText>
            </BiometricsRecommendationBox>
          )}

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

          <FundPasswordSettingsRow />

          <Row
            title={t('Auto-lock')}
            subtitle={t('Amount of time before app locks')}
            isLast
            onPress={openAutoLockOptionsModal}
          >
            <AppText bold>{getAutoLockLabel(autoLockSeconds)}</AppText>
          </Row>
        </ScreenSection>

        <ScreenSection>
          <ScreenSectionTitle>{t('Experimental features')}</ScreenSectionTitle>

          <Row title="WalletConnect" subtitle={t('Connect to dApps')} isLast>
            <Toggle value={isWalletConnectEnabled} onValueChange={handleWalletConnectEnablePress} />
          </Row>
        </ScreenSection>

        <ScreenSection>
          <ScreenSectionTitle>{t('Wallet')}</ScreenSectionTitle>

          <Row onPress={openEditWalletNameModal} title={t('Wallet name')}>
            <AppText bold>{walletName}</AppText>
          </Row>
          <Row onPress={() => navigation.navigate('AddressDiscoveryScreen')} title={t('Scan for active addresses')}>
            <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
          </Row>
          <Row onPress={() => navigation.navigate('PublicKeysScreen')} title={t('Get public keys')} isLast>
            <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
          </Row>
        </ScreenSection>
        <ScreenSection>
          <Row
            onPress={openSafePlaceWarningModal}
            title={t('View secret recovery phrase')}
            titleColor={theme.global.warning}
          >
            <Ionicons name="key" size={18} color={theme.global.warning} />
          </Row>
          <Row onPress={handleDeleteButtonPress} title={t('Delete wallet')} titleColor={theme.global.alert} isLast>
            <Ionicons name="trash" size={18} color={theme.global.alert} />
          </Row>
        </ScreenSection>
        <ScreenSection>
          <AppText style={{ textAlign: 'center' }} color="secondary">
            {t('Version')} {Application.nativeApplicationVersion} build {Application.nativeBuildVersion}
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <LinkToWeb style={{ textAlign: 'center' }} url="https://alephium.org/privacy-policy">
            {t('Privacy policy')}
          </LinkToWeb>
        </ScreenSection>
      </ScrollScreen>

      <ModalWithBackdrop animationType="fade" visible={isThemeSwitchOverlayVisible} color="black" />
    </>
  )
}

export default SettingsScreen

const BiometricsRecommendationBox = styled(Surface)`
  padding: 20px;
`
