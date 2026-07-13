import {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsProps,
  cleanExceptionMessage,
  getHumanReadableError,
  redactSensitiveData,
  throttleEvent
} from '@alephium/shared'
import { PostHogCaptureOptions } from '@posthog/core'
import { nanoid } from 'nanoid'
import PostHog from 'posthog-react-native'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { analyticsIdGenerated } from '~/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'

const PUBLIC_POSTHOG_KEY = 'phc_pDAhdhvfHzZTljrFyr1pysqdkEFIQeOHqiiRHsn4mO'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

// Both default to production behaviour: the real project key, and no capturing in dev. Set them in
// a local .env to point a dev build at a throwaway PostHog project and actually emit events, which
// is the only way to verify instrumentation end-to-end before shipping it.
const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || PUBLIC_POSTHOG_KEY
const captureInDev = process.env.EXPO_PUBLIC_POSTHOG_CAPTURE_IN_DEV === 'true'

const posthog = new PostHog(posthogKey, {
  host: PUBLIC_POSTHOG_HOST,
  disableGeoip: true,
  customAppProperties: (properties) => ({ ...properties, $ip: '', $timezone: '' }),
  captureAppLifecycleEvents: false
})

type EventAnalyticsParams = {
  event: AnalyticsEventName
  type?: 'event'
  props?: AnalyticsProps
  options?: PostHogCaptureOptions
}

type ErrorAnalyticsParams = {
  type: 'error'
  message: string
  error?: unknown
  isSensitive?: boolean
  category?: string
}

type AnalyticsParams = EventAnalyticsParams | ErrorAnalyticsParams

// Is there a better way to get the types of the arguments of the capture function of the abstract PostHogCore class
// from posthog-react-native/lib/posthog-core/src?
export const sendAnalytics = (params: AnalyticsParams) => {
  if (params.type === 'error') {
    const { error, message, isSensitive, category } = params
    console.error(message, isSensitive ? cleanExceptionMessage(error) : error)

    sendAnalytics({
      event: AnalyticsEvent.ERROR,
      props: {
        message,
        category,
        reason: error
          ? isSensitive
            ? cleanExceptionMessage(error)
            : redactSensitiveData(getHumanReadableError(error, ''))
          : undefined
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

  const shouldOptOut = !settingsLoadedFromStorage || (__DEV__ && !captureInDev)
  const canCaptureUserProperties = !shouldOptOut && analytics && !!analyticsId
  const wasAnalyticsEnabled = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (shouldOptOut) {
      posthog.optOut()
      return
    }

    if (analytics && analyticsId) {
      posthog.identify()
      posthog.optIn()
      // Only when the user actively re-enables analytics, not on initial load or app start
      if (wasAnalyticsEnabled.current === false) sendAnalytics({ event: AnalyticsEvent.ENABLED_ANALYTICS })
      wasAnalyticsEnabled.current = true
    } else if (!analytics && analyticsId) {
      // Capture the opt-out while still opted in, before the SDK stops sending events
      if (wasAnalyticsEnabled.current === true) sendAnalytics({ event: AnalyticsEvent.DISABLED_ANALYTICS })
      posthog.optOut()
      wasAnalyticsEnabled.current = false
    } else if (!analyticsId) {
      const newAnalyticsId = nanoid()
      dispatch(analyticsIdGenerated(newAnalyticsId))
    }
  }, [analytics, analyticsId, dispatch, shouldOptOut])

  const captureUserProperties = useCallback(async () => {
    if (!canCaptureUserProperties) return

    sendAnalytics({
      event: AnalyticsEvent.USER_IDENTIFIED,
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
