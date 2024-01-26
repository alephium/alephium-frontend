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
import * as Application from 'expo-application'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { Alert, Platform } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import AuthenticationModal from '~/components/AuthenticationModal'
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
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { disableBiometrics, enableBiometrics } from '~/persistent-storage/wallet'
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
  const deviceHasBiometricsData = useBiometrics()
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const requireAuth = useAppSelector((s) => s.settings.requireAuth)
  const currentTheme = useAppSelector((s) => s.settings.theme)
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const analytics = useAppSelector((s) => s.settings.analytics)
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const walletName = useAppSelector((s) => s.wallet.name)
  const theme = useTheme()
  const { resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()

  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isCurrencySelectModalOpen, setIsCurrencySelectModalOpen] = useState(false)
  const [isAuthenticationModalVisible, setIsAuthenticationModalOpen] = useState(false)
  const [isMnemonicModalVisible, setIsMnemonicModalVisible] = useState(false)
  const [isSafePlaceWarningModalOpen, setIsSafePlaceWarningModalOpen] = useState(false)
  const [isWalletDeleteModalOpen, setIsWalletDeleteModalOpen] = useState(false)
  const [isThemeSwitchOverlayVisible, setIsThemeSwitchOverlayVisible] = useState(false)
  const [authenticationPrompt, setAuthenticationPrompt] = useState('')
  const [loadingText, setLoadingText] = useState('')
  const [authCallback, setAuthCallback] = useState<() => void>(() => () => null)

  const toggleBiometrics = async () => {
    if (isBiometricsEnabled) {
      await disableBiometrics()
      dispatch(biometricsToggled(false))

      sendAnalytics('Deactivated biometrics')
    } else {
      await enableBiometrics(walletMnemonic)
      dispatch(biometricsToggled(true))

      sendAnalytics('Manually activated biometrics')
    }
  }

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const toggleTheme = (value: boolean) => {
    setIsThemeSwitchOverlayVisible(true)

    setTimeout(() => {
      dispatch(themeChanged(value ? 'dark' : 'light'))
      setIsThemeSwitchOverlayVisible(false)
    }, 500)
  }

  const toggleAuthRequirement = () => dispatch(passwordRequirementToggled())

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
      toggleWalletConnect()
    }
  }

  const handleAuthRequimementToggle = () => {
    if (requireAuth) {
      setAuthCallback(() => () => toggleAuthRequirement())
      setAuthenticationPrompt('Disable authentication')
      setLoadingText('Disabling...')
      setIsAuthenticationModalOpen(true)
    } else {
      toggleAuthRequirement()
    }
  }

  return (
    <>
      <ScrollScreenStyled verticalGap screenTitle="Settings" headerOptions={{ type: 'stack' }} {...props}>
        <ScreenSection>
          <ScreenSectionTitle>General</ScreenSectionTitle>
          <BoxSurface>
            <Row onPress={() => navigation.navigate('EditWalletNameScreen')} title="Wallet name">
              <AppText bold>{walletName}</AppText>
            </Row>
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
        <ScreenSection>
          <ScreenSectionTitle>Security</ScreenSectionTitle>
          <BoxSurface>
            <Row title="Require authentication" subtitle="For important actions" isLast>
              <Toggle value={requireAuth} onValueChange={handleAuthRequimementToggle} />
            </Row>
            {deviceHasBiometricsData && (
              <Row title="Biometrics authentication" subtitle="Enhance your security" isLast>
                <Toggle value={isBiometricsEnabled} onValueChange={toggleBiometrics} />
              </Row>
            )}
          </BoxSurface>
        </ScreenSection>

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
          <ButtonStyled
            title="Scan for active addresses"
            iconProps={{ name: 'search-outline' }}
            variant="accent"
            onPress={() => navigation.navigate('AddressDiscoveryScreen')}
          />
          <ButtonStyled
            title="View secret recovery phrase"
            iconProps={{ name: 'key' }}
            onPress={() => setIsSafePlaceWarningModalOpen(true)}
            color={theme.global.warning}
          />
          <ButtonStyled
            title="Delete wallet"
            iconProps={{ name: 'trash-outline' }}
            variant="alert"
            onPress={handleDeleteButtonPress}
          />
        </ScreenSection>
        <ScreenSection>
          <AppText style={{ textAlign: 'center' }} color="secondary">
            Version {Application.nativeApplicationVersion} build {Application.nativeBuildVersion}
          </AppText>
        </ScreenSection>
      </ScrollScreenStyled>

      <AuthenticationModal
        visible={isAuthenticationModalVisible}
        authenticationPrompt={authenticationPrompt}
        loadingText={loadingText}
        onConfirm={() => {
          setIsAuthenticationModalOpen(false)
          setAuthenticationPrompt('')
          setLoadingText('')
          authCallback()
          setAuthCallback(() => () => null)
        }}
        onClose={() => {
          setIsAuthenticationModalOpen(false)
          setAuthenticationPrompt('')
          setLoadingText('')
          setAuthCallback(() => () => null)
        }}
      />

      <ModalWithBackdrop animationType="fade" visible={isThemeSwitchOverlayVisible} color="black" />

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
                    setAuthCallback(() => () => setIsMnemonicModalVisible(true))
                    setAuthenticationPrompt("Verify it's you")
                    setLoadingText('Verifying...')
                    setIsAuthenticationModalOpen(true)
                  }}
                />
              </ScreenSection>
            </ModalContent>
          )}
        />

        <BottomModal
          isOpen={isWalletDeleteModalOpen}
          onClose={() => setIsWalletDeleteModalOpen(false)}
          maximisedContent={Platform.OS === 'ios'}
          Content={(props) => (
            <WalletDeleteModal onDelete={() => resetNavigation(navigation, 'LandingScreen')} {...props} />
          )}
        />
      </Portal>
    </>
  )
}

export default SettingsScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  gap: ${VERTICAL_GAP}px;
`

const ButtonStyled = styled(Button)`
  margin-bottom: 24px;
`
