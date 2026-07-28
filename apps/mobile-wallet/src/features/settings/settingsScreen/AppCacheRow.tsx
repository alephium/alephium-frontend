import { AnalyticsEvent } from '@alephium/shared'
import { queryClient, usePersistQueryClientContext } from '@alephium/shared-react'
import { reloadAsync } from 'expo-updates'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'

const AppCacheRow = () => {
  const { t } = useTranslation()
  const { deletePersistedCache } = usePersistQueryClientContext()
  const walletId = useAppSelector((s) => s.wallet.id)

  const deleteTanstackQueryCache = () => {
    // Before the reload, which would otherwise kill the app with the event still queued.
    sendAnalytics({ event: AnalyticsEvent.APP_CACHE_CLEARED })

    queryClient.clear()
    deletePersistedCache(walletId)
    reloadAsync()
  }

  return (
    <Row title={t('App cache')} subtitle={t('Delete app cached data and reload.')} isLast>
      <Button title={t('Clear cache')} onPress={deleteTanstackQueryCache} short />
    </Row>
  )
}

export default AppCacheRow
