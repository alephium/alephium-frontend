import { AnalyticsProps, cleanExceptionMessage, getHumanReadableError, throttleEvent } from '@alephium/shared'
import { PostHogCaptureOptions } from '@posthog/core'
import { nanoid } from 'nanoid'
import PostHog from 'posthog-react-native'
import { ReactNode, useCallback, useEffect } from 'react'

import { analyticsIdGenerated } from '~/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'

const PUBLIC_POSTHOG_KEY = 'phc_pDAhdhvfHzZTljrFyr1pysqdkEFIQeOHqiiRHsn4mO'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

export const posthog = new PostHog(PUBLIC_POSTHOG_KEY, {
  host: PUBLIC_POSTHOG_HOST,
  disableGeoip: true,
  customAppProperties: (properties) => ({ ...properties, $ip: '', $timezone: '' }),
  captureAppLifecycleEvents: false
})

type EventAnalyticsParams = {
  event: string
  type?: 'event'
  props?: AnalyticsProps
  options?: PostHogCaptureOptions
}

type ErrorAnalyticsParams = {
  type: 'error'
  message: string
  error?: unknown
  isSensitive?: boolean
}

type AnalyticsParams = EventAnalyticsParams | ErrorAnalyticsParams

// Is there a better way to get the types of the arguments of the capture function of the abstract PostHogCore class
// from posthog-react-native/lib/posthog-core/src?
export const sendAnalytics = (params: AnalyticsParams) => {
  if (params.type === 'error') {
    const { error, message, isSensitive } = params
    console.error(message, isSensitive ? cleanExceptionMessage(error) : error)

    sendAnalytics({
      event: 'Error',
      props: {
        message,
        reason: error ? (isSensitive ? cleanExceptionMessage(error) : getHumanReadableError(error, '')) : undefined
      }
    })
  } else {
    const { event, props, options } = params

    if (props) props.$ip = ''

    throttleEvent(() => posthog.capture(event, props, options), event, props)
  }
}

export const Analytics = ({ children }: { children: ReactNode }) => {
  const analytics = useAppSelector((s) => s.settings.analytics)
  const analyticsId = useAppSelector((s) => s.settings.analyticsId)
  const usesBiometrics = useAppSelector((s) => s.settings.usesBiometrics)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const requireAuth = useAppSelector((s) => s.settings.requireAuth)
  const theme = useAppSelector((s) => s.settings.theme)
  const currency = useAppSelector((s) => s.settings.currency)
  const networkName = useAppSelector((s) => s.network.name)
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()
  const dispatch = useAppDispatch()

  const shouldOptOut = !settingsLoadedFromStorage || __DEV__
  const canCaptureUserProperties = !shouldOptOut && analytics && !!analyticsId

  useEffect(() => {
    if (shouldOptOut) {
      posthog.optOut()
      return
    }

    if (analytics && analyticsId) {
      posthog.identify()
      posthog.optIn()
    } else if (!analytics && analyticsId) {
      posthog.optOut()
    } else if (!analyticsId) {
      const newAnalyticsId = nanoid()
      dispatch(analyticsIdGenerated(newAnalyticsId))
    }
  }, [analytics, analyticsId, dispatch, shouldOptOut])

  const captureUserProperties = useCallback(async () => {
    if (!canCaptureUserProperties) return

    sendAnalytics({
      event: 'User identified',
      props: {
        $set: {
          requireAuth,
          theme,
          currency,
          networkName,
          analytics,
          usesBiometrics,
          deviceSupportsBiometrics,
          deviceHasEnrolledBiometrics
        }
      }
    })
  }, [
    analytics,
    canCaptureUserProperties,
    currency,
    deviceHasEnrolledBiometrics,
    deviceSupportsBiometrics,
    networkName,
    requireAuth,
    theme,
    usesBiometrics
  ])

  useEffect(() => {
    if (canCaptureUserProperties) captureUserProperties()
  }, [canCaptureUserProperties, captureUserProperties])

  return children
}
