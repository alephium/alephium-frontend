import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Badge from '~/components/Badge'
import Button from '~/components/buttons/Button'
import { ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

const SettingsDappsSection = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const theme = useTheme()
  const { resetWalletConnectStorage, resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()

  const authorizedConnectionsCount = useAppSelector((s) => s.authorizedConnections.ids.length)

  const handleWalletConnectClearCache = () => {
    resetWalletConnectStorage()
    resetWalletConnectClientInitializationAttempts()
  }

  return (
    <ScreenSection>
      <ScreenSectionTitle>{t('DApps')}</ScreenSectionTitle>

      <Row
        title={t('Preauthorized connections')}
        subtitle={t('Manage dApp connections')}
        onPress={() => navigation.navigate('AuthorizedConnectionsScreen')}
        isLast
      >
        <Badge>{authorizedConnectionsCount}</Badge>
        <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
      </Row>
      <Row title="WalletConnect" subtitle={t('Remove all connections')} isLast>
        <Button title={t('Clear cache')} short onPress={handleWalletConnectClearCache} />
      </Row>
    </ScreenSection>
  )
}

export default SettingsDappsSection
