import { PostHogConfig, Properties } from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import AnalyticsStorage from '@/features/analytics/analyticsPersistentStorage'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/features/settings/settingsTypes'
import { currentVersion } from '@/utils/app-data'

const PUBLIC_POSTHOG_KEY = 'phc_FLKGQDmMQSdSb3qjaTwHWwm9plmz7couyVJFG9GOMr7'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

// Both default to production behaviour: the real project key, and no capturing in dev. Set them in
// a local .env to point a dev build at a throwaway PostHog project and actually emit events, which
// is the only way to verify instrumentation end-to-end before shipping it.
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || PUBLIC_POSTHOG_KEY
const captureInDev = import.meta.env.VITE_POSTHOG_CAPTURE_IN_DEV === 'true'

const options: Partial<PostHogConfig> = {
  api_host: PUBLIC_POSTHOG_HOST,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  disable_session_recording: true,
  disable_persistence: true,
  // Blanks every property that describes the machine rather than the product.
  // Replaces the deprecated `sanitize_properties`; unlike it, `before_send` gets the whole event and
  // may return null to drop it.
  before_send: (event) => {
    if (!event) return event

    // `$session_entry_*` mirrors the url/referrer/host properties for the session's first page, and
    // is matched by prefix so a new one added by a future posthog-js release cannot silently leak.
    const sessionEntryProps = Object.keys(event.properties)
      .filter((key) => key.startsWith('$session_entry_'))
      .reduce<Properties>((props, key) => ({ ...props, [key]: '' }), {})

    event.properties = {
      ...event.properties,
      ...sessionEntryProps,
      $current_url: '',
      $host: '',
      $referrer: '',
      $referring_domain: '',
      $pathname: '',
      $device_type: '',
      $browser: '',
      $raw_user_agent: '',
      $timezone: '',
      $timezone_offset: '',
      $geoip_disable: true,
      desktop_wallet_version: currentVersion
    }

    return event
  },
  loaded(posthog) {
    const { analytics } = SettingsStorage.load('general') as GeneralSettings

    if (analytics && (!import.meta.env.DEV || captureInDev)) {
      const id = AnalyticsStorage.load()

      posthog.identify(id)
      posthog.opt_in_capturing()
    } else {
      posthog.opt_out_capturing()
    }
  }
}

const AnalyticsProvider: FC = ({ children }) => (
  <PostHogProvider apiKey={posthogKey} options={options}>
    {children}
  </PostHogProvider>
)

export default AnalyticsProvider
