import {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsProps,
  cleanExceptionMessage,
  getHumanReadableError,
  normalizeAnalyticsProps,
  redactSensitiveData,
  throttleEvent
} from '@alephium/shared'
import { selectAllAddresses } from '@alephium/shared/store'
import { PostHogCaptureOptions } from '@posthog/core'
import { nanoid } from 'nanoid'
import PostHog from 'posthog-react-native'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

import { analyticsIdGenerated } from '~/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'

const PUBLIC_POSTHOG_KEY = 'phc_pDAhdhvfHzZTljrFyr1pysqdkEFIQeOHqiiRHsn4mO'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

// Both default to production behaviour: the real project key, and no capturing in dev. Set them in
// a local .env to point a dev build at a throwaway PostHog project and actually emit events, which
// is the only way to verify instrumentation end-to-end before shipping it.
const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || PUBLIC_POSTHOG_KEY
const isProductionProject = posthogKey === PUBLIC_POSTHOG_KEY

// Capturing in dev is only honoured against a throwaway project. A dev build writing to the
// production project pollutes the very metrics we make product decisions on.
const captureInDev = process.env.EXPO_PUBLIC_POSTHOG_CAPTURE_IN_DEV === 'true' && !isProductionProject

if (__DEV__ && process.env.EXPO_PUBLIC_POSTHOG_CAPTURE_IN_DEV === 'true' && isProductionProject) {
  console.warn(
    'Analytics: refusing to capture in dev against the production project. Set EXPO_PUBLIC_POSTHOG_KEY to a throwaway project to emit dev events.'
  )
}

const posthog = new PostHog(posthogKey, {
  host: PUBLIC_POSTHOG_HOST,
  disableGeoip: true,
  customAppProperties: (properties) => {
    const sanitized = { ...properties, $ip: '', $timezone: '' }
    // Some Android devices leak Build.FINGERPRINT as $os_name (e.g. "samsung/.../release-keys"); force it to "Android".
    if (typeof sanitized.$os_name === 'string' && sanitized.$os_name.includes('/')) sanitized.$os_name = 'Android'
    return sanitized
  },
  // Lifecycle events are emitted by the SDK from construction, which happens at module load, before
  // the effect below has read the stored analytics setting. Without `defaultOptIn: false` the SDK is
  // opted in for that window and an install that has never been through the settings load would
  // capture `Application Installed` / `Application Opened` regardless.
  defaultOptIn: false,
  captureAppLifecycleEvents: true
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
    const { event, options } = params
    const props = normalizeAnalyticsProps(params.props)

    throttleEvent(() => posthog.capture(event, props, options), event, props)
  }
}

// Only the route name is ever sent. Route params carry address hashes, token ids and dApp URLs, so
// passing them through would put wallet-identifying data on every screen view.
export const captureScreen = (routeName: string) => posthog.screen(routeName)

export const Analytics = ({ children }: { children: ReactNode }) => {
  const analytics = useAppSelector((s) => s.settings.analytics)
  const analyticsId = useAppSelector((s) => s.settings.analyticsId)
  const usesBiometrics = useAppSelector((s) => s.settings.usesBiometrics)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const requireAuth = useAppSelector((s) => s.settings.requireAuth)
  const theme = useAppSelector((s) => s.settings.theme)
  const currency = useAppSelector((s) => s.settings.currency)
  const networkName = useAppSelector((s) => s.network.name)
  const language = useAppSelector((s) => s.settings.language)
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const hasFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const walletCount = useAppSelector((s) => s.wallets.list.length)
  const addressCount = useAppSelector((s) => selectAllAddresses(s).length)
  const contactCount = useAppSelector((s) => selectAllContacts(s).length)
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
          deviceHasEnrolledBiometrics,
          language,
          discreetMode,
          autoLockSeconds,
          hasFundPassword,
          walletCount,
          addressCount,
          contactCount
        }
      }
    })
  }, [
    addressCount,
    analytics,
    autoLockSeconds,
    canCaptureUserProperties,
    contactCount,
    currency,
    deviceHasEnrolledBiometrics,
    deviceSupportsBiometrics,
    discreetMode,
    hasFundPassword,
    language,
    networkName,
    requireAuth,
    theme,
    usesBiometrics,
    walletCount
  ])

  useEffect(() => {
    if (canCaptureUserProperties) captureUserProperties()
  }, [canCaptureUserProperties, captureUserProperties])

  return children
}
