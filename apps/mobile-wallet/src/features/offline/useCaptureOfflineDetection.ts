import { AnalyticsEvent, AnalyticsProps } from '@alephium/shared'
import { useIsExplorerOffline, useIsNodeOffline } from '@alephium/shared-react'
import { useEffect, useRef } from 'react'

import { sendAnalytics } from '~/analytics'

// Mounted app-wide rather than from a screen: an outage that starts before the user reaches the
// Dashboard is still an outage. Re-fires when the affected service changes, so an explorer-only
// outage escalating to both is recorded rather than swallowed by the first report.
const useCaptureOfflineDetection = () => {
  const isNodeOffline = useIsNodeOffline()
  const isExplorerOffline = useIsExplorerOffline()

  const reportedService = useRef<AnalyticsProps['service']>(undefined)

  useEffect(() => {
    const service: AnalyticsProps['service'] | undefined =
      isNodeOffline && isExplorerOffline ? 'both' : isNodeOffline ? 'node' : isExplorerOffline ? 'explorer' : undefined

    if (service && service !== reportedService.current)
      sendAnalytics({ event: AnalyticsEvent.OFFLINE_DETECTED, props: { service } })

    reportedService.current = service
  }, [isExplorerOffline, isNodeOffline])
}

export default useCaptureOfflineDetection
