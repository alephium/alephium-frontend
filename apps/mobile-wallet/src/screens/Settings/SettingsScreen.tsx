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
import { Trans, useTranslation } from 'react-i18next'
import { Alert, Platform } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import Button from '~/components/buttons/Button'
import BottomModal from '~/components/layout/BottomModal'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import Row from '~/components/Row'
import LinkToWeb from '~/components/text/LinkToWeb'
import Toggle from '~/components/Toggle'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import AutoLockOptionsModal from '~/features/auto-lock/AutoLockOptionsModal'
import { getAutoLockLabel } from '~/features/auto-lock/utils'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { languageOptions } from '~/features/localization/languages'
import LanguageSelectModal from '~/features/localization/LanguageSelectModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics, useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import CurrencySelectModal from '~/screens/CurrencySelectModal'
import MnemonicModal from '~/screens/Settings/MnemonicModal'
import WalletDeleteModal from '~/screens/Settings/WalletDeleteModal'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'
import {
  analyticsToggled,
  biometricsToggled,
  discreetModeToggled,
  passwordRequirementToggled,
  themeChanged,
  walletConnectToggled
} from '~/store/settingsSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { resetNavigation } from '~/utils/navigation'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SettingsScreen'>, ScrollScreenProps {}

const SettingsScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const biometricsRequiredForTransactions = useAppSelector((s) => s.settings.requireAuth)
  const currentTheme = useAppSelector((s) => s.settings.theme)
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const language = useAppSelector((s) => s.settings.language)
  const analytics = useAppSelector((s) => s.settings.analytics)
  const walletName = useAppSelector((s) => s.wallet.name)
  const theme = useTheme()
  const { resetWalletConnectClientInitializationAttempts, resetWalletConnectStorage } = useWalletConnectContext()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard, fundPasswordModal } = useFundPasswordGuard()
  const { t } = useTranslation()

  const [isAutoLockSecondsModalOpen, setIsAutoLockSecondsModalOpen] = useState(false)
  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isCurrencySelectModalOpen, setIsCurrencySelectModalOpen] = useState(false)
  const [isLanguageSelectModalOpen, setIsLanguageSelectModalOpen] = useState(false)
  const [isMnemonicModalVisible, setIsMnemonicModalVisible] = useState(false)
  const [isSafePlaceWarningModalOpen, setIsSafePlaceWarningModalOpen] = useState(false)
  const [isWalletDeleteModalOpen, setIsWalletDeleteModalOpen] = useState(false)
  const [isThemeSwitchOverlayVisible, setIsThemeSwitchOverlayVisible] = useState(false)
  const [isBiometricsWarningModalOpen, setIsBiometricsWarningModalOpen] = useState(false)
  const [lastToggledBiometricsSetting, setLastToggledBiometricsSetting] = useState<
    'appAccess' | 'transactions' | undefined
  >()

  const handleBiometricsAppAccessChange = (value: boolean) => {
    if (value || biometricsRequiredForTransactions) {
      toggleBiometricsAppAccess()
    } else {
      setLastToggledBiometricsSetting('appAccess')
      setIsBiometricsWarningModalOpen(true)
    }
  }

  const handleBiometricsTransactionsChange = (value: boolean) => {
    if (value || biometricsRequiredForAppAccess) {
      toggleBiometricsTransactions()
    } else {
      setLastToggledBiometricsSetting('transactions')
      setIsBiometricsWarningModalOpen(true)
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
    setIsBiometricsWarningModalOpen(false)

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
    setIsWalletDeleteModalOpen(true)
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
      <ScrollScreenStyled verticalGap screenTitle={t('Settings')} headerOptions={{ type: 'stack' }} {...props}>
        <ScreenSection>
          <ScreenSectionTitle>{t('General')}</ScreenSectionTitle>
          <BoxSurface>
            <Row onPress={() => setIsLanguageSelectModalOpen(true)} title="Language">
              <AppText bold>{languageOptions.find((l) => l.value === language)?.label}</AppText>
            </Row>
            <Row onPress={() => setIsCurrencySelectModalOpen(true)} title={t('Currency')}>
              <AppText bold>{currentCurrency}</AppText>
            </Row>
            <Row title={t('Current network')} onPress={() => setIsSwitchNetworkModalOpen(true)}>
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
          </BoxSurface>
        </ScreenSection>
        {deviceSupportsBiometrics && (
          <ScreenSection>
            <ScreenSectionTitle>{t('Security')}</ScreenSectionTitle>
            {!deviceHasEnrolledBiometrics && (
              <BiometricsRecommendationBox type="accent">
                <AppText color="accent">
                  {t(
                    "Your device supports biometrics but none is enrolled. Enable them by adding a fingerprint or Face ID in your device's settings."
                  )}
                </AppText>
              </BiometricsRecommendationBox>
            )}
            <BoxSurface>
              <Row
                title={t('App access')}
                subtitle={t(
                  deviceHasEnrolledBiometrics
                    ? 'Require biometrics to open app'
                    : Platform.OS === 'ios'
                      ? 'Require device passcode to open app'
                      : 'Require device screen lock code or pattern to open app'
                )}
              >
                <Toggle value={isBiometricsEnabled} onValueChange={handleBiometricsAppAccessChange} />
              </Row>
              <Row
                title={t('Transactions')}
                subtitle={t(
                  deviceHasEnrolledBiometrics
                    ? 'Require biometrics to transact'
                    : Platform.OS === 'ios'
                      ? 'Require device passcode to transact'
                      : 'Require device screen lock code or pattern to transact'
                )}
              >
                <Toggle value={biometricsRequiredForTransactions} onValueChange={handleBiometricsTransactionsChange} />
              </Row>
              <Row
                onPress={() =>
                  isUsingFundPassword &&
                  navigation.navigate('FundPasswordScreen', { origin: 'settings', newPassword: false })
                }
                title={t('Fund password')}
                subtitle={t('Enhance your security')}
              >
                {isUsingFundPassword ? (
                  <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
                ) : (
                  <Toggle
                    value={false}
                    onValueChange={() =>
                      navigation.navigate('FundPasswordScreen', { origin: 'settings', newPassword: true })
                    }
                  />
                )}
              </Row>
              <Row
                title={t('Auto-lock')}
                subtitle={t('Amount of time before app locks')}
                isLast
                onPress={() => setIsAutoLockSecondsModalOpen(true)}
              >
                <AppText bold>{getAutoLockLabel(autoLockSeconds)}</AppText>
              </Row>
            </BoxSurface>
          </ScreenSection>
        )}

        <ScreenSection>
          <ScreenSectionTitle>{t('Experimental features')}</ScreenSectionTitle>
          <BoxSurface>
            <Row title="WalletConnect" subtitle={t('Connect to dApps')} isLast>
              <Toggle value={isWalletConnectEnabled} onValueChange={handleWalletConnectEnablePress} />
            </Row>
          </BoxSurface>
        </ScreenSection>

        <ScreenSection>
          <ScreenSectionTitle>{t('Wallet')}</ScreenSectionTitle>
          <BoxSurface>
            <Row onPress={() => navigation.navigate('EditWalletNameScreen')} title={t('Wallet name')}>
              <AppText bold>{walletName}</AppText>
            </Row>
            <Row onPress={() => navigation.navigate('AddressDiscoveryScreen')} title={t('Scan for active addresses')}>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
            </Row>
            <Row onPress={() => navigation.navigate('PublicKeysScreen')} title={t('Get public keys')} isLast>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <BoxSurface>
            <Row
              onPress={() => setIsSafePlaceWarningModalOpen(true)}
              title={t('View secret recovery phrase')}
              titleColor={theme.global.warning}
            >
              <Ionicons name="key" size={18} color={theme.global.warning} />
            </Row>
            <Row onPress={handleDeleteButtonPress} title={t('Delete wallet')} titleColor={theme.global.alert} isLast>
              <Ionicons name="trash" size={18} color={theme.global.alert} />
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <AppText style={{ textAlign: 'center' }} color="secondary">
            {t('Version')} {Application.nativeApplicationVersion} build {Application.nativeBuildVersion}
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <LinkToWeb
            style={{ textAlign: 'center' }}
            text={t('Privacy policy')}
            url="https://alephium.org/privacy-policy"
          />
        </ScreenSection>
      </ScrollScreenStyled>

      <ModalWithBackdrop animationType="fade" visible={isThemeSwitchOverlayVisible} color="black" />

      <Portal>
        <BottomModal
          isOpen={isSafePlaceWarningModalOpen}
          onClose={() => setIsSafePlaceWarningModalOpen(false)}
          Content={(props) => (
            <ModalContent verticalGap {...props}>
              <ScreenSection>
                <BottomModalScreenTitle>{t('Be careful!')} 🕵️‍♀️</BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                <AppText color="secondary" size={18}>
                  {t("Don't share your secret recovery phrase with anyone!")}
                </AppText>
                <AppText color="secondary" size={18}>
                  <Trans
                    t={t}
                    i18nKey="viewMnemonicModalWarning"
                    components={{
                      1: <AppText bold size={18} />
                    }}
                  >
                    {'Before displaying it, make sure to be in an <1>non-public</1> space.'}
                  </Trans>
                </AppText>
              </ScreenSection>
              <ScreenSection>
                <Button
                  title={t('I understand')}
                  variant="accent"
                  onPress={() => {
                    props.onClose && props.onClose()

                    triggerBiometricsAuthGuard({
                      settingsToCheck: 'appAccessOrTransactions',
                      successCallback: () =>
                        triggerFundPasswordAuthGuard({
                          successCallback: () => setIsMnemonicModalVisible(true)
                        })
                    })
                  }}
                />
              </ScreenSection>
            </ModalContent>
          )}
        />
      </Portal>

      <Portal>
        <BottomModal
          isOpen={isSwitchNetworkModalOpen}
          onClose={() => setIsSwitchNetworkModalOpen(false)}
          Content={(props) => (
            <SwitchNetworkModal
              onClose={() => setIsSwitchNetworkModalOpen(false)}
              onCustomNetworkPress={() => navigation.navigate('CustomNetworkScreen')}
              {...props}
            />
          )}
        />

        <BottomModal
          isOpen={isLanguageSelectModalOpen}
          onClose={() => setIsLanguageSelectModalOpen(false)}
          Content={(props) => <LanguageSelectModal onClose={() => setIsLanguageSelectModalOpen(false)} {...props} />}
        />

        <BottomModal
          isOpen={isCurrencySelectModalOpen}
          onClose={() => setIsCurrencySelectModalOpen(false)}
          Content={(props) => <CurrencySelectModal onClose={() => setIsCurrencySelectModalOpen(false)} {...props} />}
        />

        <BottomModal
          isOpen={isAutoLockSecondsModalOpen}
          onClose={() => setIsAutoLockSecondsModalOpen(false)}
          Content={(props) => <AutoLockOptionsModal onClose={() => setIsAutoLockSecondsModalOpen(false)} {...props} />}
        />

        <BottomModal
          isOpen={isMnemonicModalVisible}
          onClose={() => setIsMnemonicModalVisible(false)}
          Content={(props) => <MnemonicModal {...props} />}
        />

        <BottomModal
          isOpen={isWalletDeleteModalOpen}
          onClose={() => setIsWalletDeleteModalOpen(false)}
          maximisedContent={Platform.OS === 'ios'}
          Content={(props) => (
            <WalletDeleteModal onDelete={() => resetNavigation(navigation, 'LandingScreen')} {...props} />
          )}
        />

        <BottomModal
          isOpen={isBiometricsWarningModalOpen}
          onClose={() => setIsBiometricsWarningModalOpen(false)}
          Content={(props) => <BiometricsWarningModal onConfirm={handleDisableBiometricsPress} {...props} />}
        />
      </Portal>
      {fundPasswordModal}
    </>
  )
}

export default SettingsScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  gap: ${VERTICAL_GAP}px;
`

const BiometricsRecommendationBox = styled(BoxSurface)`
  padding: 20px;
  margin-bottom: ${VERTICAL_GAP}px;
`
