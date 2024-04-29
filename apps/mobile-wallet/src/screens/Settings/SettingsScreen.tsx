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
import Toggle from '~/components/Toggle'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricPrompt } from '~/hooks/useBiometricPrompt'
import useBiometrics from '~/hooks/useBiometrics'
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
  const analytics = useAppSelector((s) => s.settings.analytics)
  const walletName = useAppSelector((s) => s.wallet.name)
  const theme = useTheme()
  const { resetWalletConnectClientInitializationAttempts, resetWalletConnectStorage } = useWalletConnectContext()
  const { triggerBiometricsPrompt } = useBiometricPrompt()

  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isCurrencySelectModalOpen, setIsCurrencySelectModalOpen] = useState(false)
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
    if (isBiometricsEnabled) {
      triggerBiometricsPrompt({
        successCallback: () => dispatch(biometricsToggled())
      })
    } else {
      dispatch(biometricsToggled())
    }
  }

  const toggleBiometricsTransactions = () => {
    if (biometricsRequiredForTransactions) {
      triggerBiometricsPrompt({
        successCallback: () => dispatch(passwordRequirementToggled())
      })
    } else {
      dispatch(passwordRequirementToggled())
    }
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
        'Enabling experimental feature',
        'The WalletConnect feature is experimental, use it at your own risk.',
        [
          { text: 'Cancel' },
          {
            text: 'I understand',
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
      <ScrollScreenStyled verticalGap screenTitle="Settings" headerOptions={{ type: 'stack' }} {...props}>
        <ScreenSection>
          <ScreenSectionTitle>General</ScreenSectionTitle>
          <BoxSurface>
            <Row onPress={() => setIsCurrencySelectModalOpen(true)} title="Currency">
              <AppText bold>{currentCurrency}</AppText>
            </Row>
            <Row title="Current network" onPress={() => setIsSwitchNetworkModalOpen(true)}>
              <AppText bold>{capitalize(currentNetworkName)}</AppText>
            </Row>
            <Row title="Discreet mode" subtitle="Hide all amounts">
              <Toggle value={discreetMode} onValueChange={toggleDiscreetMode} />
            </Row>

            <Row title="Use dark theme" subtitle="Try it, it's nice">
              <Toggle value={currentTheme === 'dark'} onValueChange={toggleTheme} />
            </Row>
            <Row title="Analytics" subtitle="Help us improve your experience!" isLast>
              <Toggle value={analytics} onValueChange={toggleAnalytics} />
            </Row>
          </BoxSurface>
        </ScreenSection>
        {deviceSupportsBiometrics && (
          <ScreenSection>
            <ScreenSectionTitle>Security</ScreenSectionTitle>
            {!deviceHasEnrolledBiometrics && (
              <AppText color="secondary" style={{ marginBottom: 20, paddingHorizontal: 10 }}>
                Your device supports biometrics but none is enrolled. Enable them by adding a fingeprint or Face ID in
                your device's settings.
              </AppText>
            )}
            <BoxSurface>
              <Row title="App access" subtitle="Require biometrics to open app">
                <Toggle
                  value={isBiometricsEnabled}
                  onValueChange={handleBiometricsAppAccessChange}
                  disabled={!deviceHasEnrolledBiometrics}
                />
              </Row>
              <Row title="Transactions" subtitle="Require biometrics to transact" isLast>
                <Toggle
                  value={biometricsRequiredForTransactions}
                  onValueChange={handleBiometricsTransactionsChange}
                  disabled={!deviceHasEnrolledBiometrics}
                />
              </Row>
            </BoxSurface>
          </ScreenSection>
        )}

        <ScreenSection>
          <ScreenSectionTitle>Experimental features</ScreenSectionTitle>
          <BoxSurface>
            <Row title="WalletConnect" subtitle="Connect to dApps" isLast>
              <Toggle value={isWalletConnectEnabled} onValueChange={handleWalletConnectEnablePress} />
            </Row>
          </BoxSurface>
        </ScreenSection>

        <ScreenSection>
          <ScreenSectionTitle>Wallet</ScreenSectionTitle>
          <BoxSurface>
            <Row onPress={() => navigation.navigate('EditWalletNameScreen')} title="Wallet name">
              <AppText bold>{walletName}</AppText>
            </Row>
            <Row onPress={() => navigation.navigate('AddressDiscoveryScreen')} title="Scan for active addresses">
              <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
            </Row>
            <Row onPress={() => navigation.navigate('PublicKeysScreen')} title="Get public keys" isLast>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <BoxSurface>
            <Row
              onPress={() => setIsSafePlaceWarningModalOpen(true)}
              title="View secret recovery phrase"
              titleColor={theme.global.warning}
            >
              <Ionicons name="key" size={18} color={theme.global.warning} />
            </Row>
            <Row onPress={handleDeleteButtonPress} title="Delete wallet" titleColor={theme.global.alert} isLast>
              <Ionicons name="trash" size={18} color={theme.global.alert} />
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <AppText style={{ textAlign: 'center' }} color="secondary">
            Version {Application.nativeApplicationVersion} build {Application.nativeBuildVersion}
          </AppText>
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
                <BottomModalScreenTitle>Be careful! 🕵️‍♀️</BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                <AppText color="secondary" size={18}>
                  Don&apos;t share your secret recovery phrase with anyone!
                </AppText>
                <AppText color="secondary" size={18}>
                  Before displaying it, make sure to be in an{' '}
                  <AppText bold size={18}>
                    non-public
                  </AppText>{' '}
                  space.
                </AppText>
              </ScreenSection>
              <ScreenSection>
                <Button
                  title="I get it"
                  variant="accent"
                  onPress={() => {
                    props.onClose && props.onClose()

                    if (biometricsRequiredForAppAccess || biometricsRequiredForTransactions) {
                      triggerBiometricsPrompt({
                        successCallback: () => setIsMnemonicModalVisible(true)
                      })
                    } else {
                      setIsMnemonicModalVisible(true)
                    }
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
          isOpen={isCurrencySelectModalOpen}
          onClose={() => setIsCurrencySelectModalOpen(false)}
          Content={(props) => <CurrencySelectModal onClose={() => setIsCurrencySelectModalOpen(false)} {...props} />}
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
    </>
  )
}

export default SettingsScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  gap: ${VERTICAL_GAP}px;
`
