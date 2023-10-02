/*
Copyright 2018 - 2022 The Alephium Authors
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
import { capitalize } from 'lodash'
import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'
import { Alert } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import BottomModal from '~/components/layout/BottomModal'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deleteWallet, disableBiometrics, enableBiometrics } from '~/persistent-storage/wallet'
import CurrencySelectModal from '~/screens/CurrencySelectModal'
import MnemonicModal from '~/screens/Settings/MnemonicModal'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'
import {
  analyticsToggled,
  biometricsToggled,
  discreetModeToggled,
  passwordRequirementToggled,
  themeChanged,
  walletConnectToggled
} from '~/store/settingsSlice'
import { walletDeleted } from '~/store/wallet/walletActions'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { resetNavigationState } from '~/utils/navigation'

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
  const posthog = usePostHog()

  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isCurrencySelectModalOpen, setIsCurrencySelectModalOpen] = useState(false)
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [isMnemonicModalVisible, setIsMnemonicModalVisible] = useState(false)

  const toggleBiometrics = async () => {
    if (isBiometricsEnabled) {
      await disableBiometrics()
      dispatch(biometricsToggled(false))

      posthog?.capture('Deactivated biometrics')
    } else {
      await enableBiometrics(walletMnemonic)
      dispatch(biometricsToggled(true))

      posthog?.capture('Manually activated biometrics')
    }
  }

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const toggleTheme = (value: boolean) => dispatch(themeChanged(value ? 'dark' : 'light'))

  const toggleAuthRequirement = () => dispatch(passwordRequirementToggled())

  const toggleAnalytics = () => dispatch(analyticsToggled())

  const toggleWalletConnect = () => dispatch(walletConnectToggled())

  const handleDeleteConfirmPress = async () => {
    await deleteWallet()

    resetNavigationState('LandingScreen')

    dispatch(walletDeleted())
    posthog?.capture('Deleted wallet')
  }

  const handleDeleteButtonPress = () => {
    Alert.alert(
      'Deleting wallet',
      'Are you sure you want to delete your wallet? Ensure you have a backup of your secret recovery phrase.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: handleDeleteConfirmPress
        }
      ]
    )
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
            onPress: toggleWalletConnect
          }
        ]
      )
    } else {
      toggleWalletConnect()
    }
  }

  return (
    <>
      <ScrollScreenStyled verticalGap headerOptions={{ headerTitle: 'Settings', type: 'stack' }} {...props}>
        <ScreenSection>
          <ScreenSectionTitle>General</ScreenSectionTitle>
          <BoxSurface>
            <Row title="Discreet mode" subtitle="Hide all amounts">
              <Toggle value={discreetMode} onValueChange={toggleDiscreetMode} />
            </Row>
            <Row title="Require authentication" subtitle="For important actions">
              <Toggle value={requireAuth} onValueChange={toggleAuthRequirement} />
            </Row>
            <Row title="Use dark theme" subtitle="Try it, it's nice">
              <Toggle value={currentTheme === 'dark'} onValueChange={toggleTheme} />
            </Row>
            {deviceHasBiometricsData && (
              <Row title="Biometrics authentication" subtitle="Enhance your security">
                <Toggle value={isBiometricsEnabled} onValueChange={toggleBiometrics} />
              </Row>
            )}
            <Row title="Analytics" subtitle="Help us improve your experience!">
              <Toggle value={analytics} onValueChange={toggleAnalytics} />
            </Row>
            <Row onPress={() => setIsCurrencySelectModalOpen(true)} title="Currency" isLast>
              <AppText bold>{currentCurrency}</AppText>
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Networks</ScreenSectionTitle>
          <BoxSurface>
            <Row title="Current network" onPress={() => setIsSwitchNetworkModalOpen(true)} isLast>
              <AppText bold>{capitalize(currentNetworkName)}</AppText>
            </Row>
          </BoxSurface>
        </ScreenSection>
        <ScreenSection>
          <ScreenSectionTitle>Addresses</ScreenSectionTitle>
          <Button
            title="Scan for active addresses"
            iconProps={{ name: 'search-outline' }}
            onPress={() => navigation.navigate('AddressDiscoveryScreen')}
          />
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
            title="View secret recovery phrase"
            iconProps={{ name: 'key' }}
            onPress={() => setIsAuthenticationModalVisible(true)}
          />
          <ButtonStyled
            title="Delete wallet"
            iconProps={{ name: 'trash-outline' }}
            variant="alert"
            onPress={handleDeleteButtonPress}
          />
        </ScreenSection>
      </ScrollScreenStyled>

      {isAuthenticationModalVisible && (
        <ConfirmWithAuthModal
          onConfirm={() => {
            setIsAuthenticationModalVisible(false)
            setIsMnemonicModalVisible(true)
          }}
          onClose={() => setIsAuthenticationModalVisible(false)}
        />
      )}

      <Portal>
        <BottomModal
          isOpen={isSwitchNetworkModalOpen}
          onClose={() => setIsSwitchNetworkModalOpen(false)}
          Content={(props) => <SwitchNetworkModal onClose={() => setIsSwitchNetworkModalOpen(false)} {...props} />}
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
