import { useTranslation } from 'react-i18next'

import { useAppSelector } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

const useWalletConnectToasts = () => {
  const isInEcosystemInAppBrowser = useAppSelector((s) => s.dAppBrowser.isInEcosystemInAppBrowser)
  const { t } = useTranslation()

  const text2 = !isInEcosystemInAppBrowser ? t('You can go back to your browser.') : undefined

  return {
    showApprovedToast: () => showToast({ text1: t('dApp request approved'), text2 }),
    showRejectedToast: () => showToast({ text1: t('dApp request rejected'), text2, type: 'info' })
  }
}

export default useWalletConnectToasts
