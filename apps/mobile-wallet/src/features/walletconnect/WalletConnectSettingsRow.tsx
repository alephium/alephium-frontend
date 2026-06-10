import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'

const WalletConnectSettingsRow = () => {
  const { t } = useTranslation()
  const { resetWalletConnectStorage, resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()

  const handleWalletConnectClearCache = () => {
    resetWalletConnectStorage()
    resetWalletConnectClientInitializationAttempts()
  }

  return (
    <Row title="WalletConnect" subtitle={t('Remove all connections')} isLast>
      <Button title={t('Clear cache')} short onPress={handleWalletConnectClearCache} />
    </Row>
  )
}

export default WalletConnectSettingsRow
