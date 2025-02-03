import { useTranslation } from 'react-i18next'

import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { showToast } from '~/utils/layout'

const useWalletConnectToasts = () => {
  const { isInEcosystemInAppBrowser } = useWalletConnectContext()
  const { t } = useTranslation()

  const text2 = !isInEcosystemInAppBrowser ? t('You can go back to your browser.') : undefined

  return {
    showApprovedToast: () => showToast({ text1: t('dApp request approved'), text2 }),
    showRejectedToast: () => showToast({ text1: t('dApp request rejected'), text2, type: 'info' })
  }
}

export default useWalletConnectToasts
