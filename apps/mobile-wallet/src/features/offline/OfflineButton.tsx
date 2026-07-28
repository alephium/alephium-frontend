import { useIsExplorerOffline, useIsNodeOffline } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { showToast, ToastDuration } from '~/utils/layout'

const OfflineButton = () => {
  const isNodeOffline = useIsNodeOffline()
  const isExplorerOffline = useIsExplorerOffline()
  const { t } = useTranslation()

  if (!isNodeOffline && !isExplorerOffline) return null

  const showOfflineMessage = () => {
    showToast({
      text1: `${t('Reconnecting')}...`,
      text2:
        isNodeOffline && isExplorerOffline
          ? t('There is an issue connecting to the node and explorer backend servers.')
          : isNodeOffline
            ? t('The node is offline. You can see your balances but you cannot send transactions.')
            : t(
                'The explorer backend is offline. You can still see your balances and send transactions but some data might be missing.'
              ),
      type: 'info',
      visibilityTime: ToastDuration.LONG
    })
  }

  return (
    <Button
      onPress={showOfflineMessage}
      iconProps={{ name: 'cloud-offline-outline' }}
      variant="alert"
      squared
      compact
    />
  )
}

export default OfflineButton
