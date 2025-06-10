import Ionicons from '@expo/vector-icons/Ionicons'
import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { capitalize } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import Row from '~/components/Row'
import LinkToWeb from '~/components/text/LinkToWeb'
import Toggle from '~/components/Toggle'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { languageOptions } from '~/features/localization/languages'
import { openModal } from '~/features/modals/modalActions'
import RegionSettingsRow from '~/features/settings/regionSettings/RegionSettingsRow'
import SettingsAssetsSection from '~/features/settings/settingsScreen/SettingsAssetsSection'
import SettingsDevSection from '~/features/settings/settingsScreen/SettingsDevSection'
import SettingsSecuritySection from '~/features/settings/settingsScreen/SettingsSecuritySection'
import { analyticsToggled, discreetModeToggled, themeChanged } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { resetNavigation } from '~/utils/navigation'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SettingsScreen'>, ScrollScreenProps {}

const SettingsScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const { t } = useTranslation()
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const currentTheme = useAppSelector((s) => s.settings.theme)
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const language = useAppSelector((s) => s.settings.language)
  const analytics = useAppSelector((s) => s.settings.analytics)
  const walletName = useAppSelector((s) => s.wallet.name)

  const { resetWalletConnectClientInitializationAttempts, resetWalletConnectStorage } = useWalletConnectContext()
  const [isThemeSwitchOverlayVisible, setIsThemeSwitchOverlayVisible] = useState(false)

  const openLanguageSelectModal = () => dispatch(openModal({ name: 'LanguageSelectModal' }))

  const openCurrencySelectModal = () => dispatch(openModal({ name: 'CurrencySelectModal' }))

  const openNetworkModal = () =>
    dispatch(
      openModal({
        name: 'SwitchNetworkModal',
        props: { onCustomNetworkPress: () => navigation.navigate('CustomNetworkScreen') }
      })
    )

  const openEditWalletNameModal = () => dispatch(openModal({ name: 'EditWalletNameModal' }))

  const openSafePlaceWarningModal = () => dispatch(openModal({ name: 'SafePlaceWarningModal' }))

  const toggleDiscreetMode = () => dispatch(discreetModeToggled())

  const toggleTheme = (value: boolean) => {
    setIsThemeSwitchOverlayVisible(true)

    setTimeout(() => {
      dispatch(themeChanged(value ? 'dark' : 'light'))
      setIsThemeSwitchOverlayVisible(false)
    }, 500)
  }

  const toggleAnalytics = () => dispatch(analyticsToggled())

  const handleDeleteButtonPress = () => {
    dispatch(
      openModal({ name: 'WalletDeleteModal', props: { onDelete: () => resetNavigation(navigation, 'LandingScreen') } })
    )
  }

  const handleWalletConnectClearCache = () => {
    resetWalletConnectStorage()
    resetWalletConnectClientInitializationAttempts()
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

          <RegionSettingsRow />

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

        <SettingsSecuritySection />

        <SettingsAssetsSection />

        <ScreenSection>
          <ScreenSectionTitle>{t('DApps')}</ScreenSectionTitle>

          <Row title="WalletConnect" subtitle={t('Remove all connections')} isLast>
            <Button title={t('Clear cache')} short onPress={handleWalletConnectClearCache} />
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
            <Ionicons name="trash-outline" size={18} color={theme.global.alert} />
          </Row>
        </ScreenSection>

        {__DEV__ && <SettingsDevSection />}

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
