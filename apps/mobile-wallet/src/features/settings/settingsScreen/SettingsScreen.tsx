import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import LinkToWeb from '~/components/text/LinkToWeb'
import RegionSettingsRow from '~/features/settings/regionSettings/RegionSettingsRow'
import AddressDiscoveryRow from '~/features/settings/settingsScreen/AddressDiscoveryRow'
import AnalyticsRow from '~/features/settings/settingsScreen/AnalyticsRow'
import AppCacheRow from '~/features/settings/settingsScreen/AppCacheRow'
import CurrencyRow from '~/features/settings/settingsScreen/CurrencyRow'
import DeleteWalletRow from '~/features/settings/settingsScreen/DeleteWalletRow'
import DiscreetModeRow from '~/features/settings/settingsScreen/DiscreetModeRow'
import ImportWatchOnlyWalletRow from '~/features/settings/settingsScreen/ImportWatchOnlyWalletRow'
import LanguageRow from '~/features/settings/settingsScreen/LanguageRow'
import NetworkRow from '~/features/settings/settingsScreen/NetworkRow'
import PublicKeysRow from '~/features/settings/settingsScreen/PublicKeysRow'
import RecoveryPhraseRow from '~/features/settings/settingsScreen/RecoveryPhraseRow'
import SettingsAssetsSection from '~/features/settings/settingsScreen/SettingsAssetsSection'
import SettingsDappsSection from '~/features/settings/settingsScreen/SettingsDappsSection'
import SettingsDevSection from '~/features/settings/settingsScreen/SettingsDevSection'
import SettingsSecuritySection from '~/features/settings/settingsScreen/SettingsSecuritySection'
import ThemeRow from '~/features/settings/settingsScreen/ThemeRow'
import WalletNameRow from '~/features/settings/settingsScreen/WalletNameRow'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SettingsScreen'>, ScrollScreenProps {}

const SettingsScreen = (props: ScreenProps) => {
  const { t } = useTranslation()

  return (
    <ScrollScreen
      verticalGap
      screenTitle={t('Settings')}
      headerOptions={{ type: 'stack' }}
      contentPaddingTop
      {...props}
    >
      <ScreenSection>
        <ScreenSectionTitle>{t('General')}</ScreenSectionTitle>
        <ImportWatchOnlyWalletRow />
        <LanguageRow />
        <RegionSettingsRow />
        <CurrencyRow />
        <NetworkRow />
        <DiscreetModeRow />
        <ThemeRow />
        <AnalyticsRow />
        <AppCacheRow />
      </ScreenSection>
      <SettingsSecuritySection />
      <SettingsAssetsSection />
      <SettingsDappsSection />
      <ScreenSection>
        <ScreenSectionTitle>{t('Wallet')}</ScreenSectionTitle>
        <WalletNameRow />
        <AddressDiscoveryRow />
        <PublicKeysRow />
      </ScreenSection>
      <ScreenSection>
        <RecoveryPhraseRow />
        <DeleteWalletRow />
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
  )
}

export default SettingsScreen
