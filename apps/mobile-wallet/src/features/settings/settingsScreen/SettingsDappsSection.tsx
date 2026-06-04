import { useTranslation } from 'react-i18next'

import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import AuthorizedConnectionsSettingsRow from '~/features/ecosystem/authorizedConnections/AuthorizedConnectionsSettingsRow'
import ApprovedUnverifiedDappsSettingsRow from '~/features/ecosystem/unverifiedDapps/ApprovedUnverifiedDappsSettingsRow'
import WalletConnectSettingsRow from '~/features/walletconnect/WalletConnectSettingsRow'

const SettingsDappsSection = () => {
  const { t } = useTranslation()

  return (
    <ScreenSection>
      <ScreenSectionTitle>{t('DApps')}</ScreenSectionTitle>
      <AuthorizedConnectionsSettingsRow />
      <ApprovedUnverifiedDappsSettingsRow />
      <WalletConnectSettingsRow />
    </ScreenSection>
  )
}

export default SettingsDappsSection
