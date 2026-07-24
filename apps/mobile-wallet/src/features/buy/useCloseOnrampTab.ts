import { AnalyticsEvent } from '@alephium/shared'
import { useURL } from 'expo-linking'
import { dismissBrowser } from 'expo-web-browser'
import { useEffect } from 'react'

import { sendAnalytics } from '~/analytics'

const CLOSE_ONRAMP_TAB_DEEP_LINK = 'alephium://close-onramp-tab'

// Mounted app-wide, not in BuyModal: opening the provider dismisses that modal, so it is unmounted
// long before the redirect arrives.
const useCloseOnrampTab = () => {
  const deeplink = useURL()

  useEffect(() => {
    if (!deeplink?.includes(CLOSE_ONRAMP_TAB_DEEP_LINK)) return

    dismissBrowser()
    sendAnalytics({ event: AnalyticsEvent.BUY_COMPLETED, props: { provider: 'onramper' } })
  }, [deeplink])
}

export default useCloseOnrampTab
