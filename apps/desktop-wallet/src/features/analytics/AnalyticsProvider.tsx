import { PostHogConfig } from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import AnalyticsStorage from '@/features/analytics/analyticsPersistentStorage'
import scrubEvent from '@/features/analytics/scrubEvent'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/features/settings/settingsTypes'

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
  // Replaces the deprecated `sanitize_properties`; unlike it, `before_send` gets the whole event
  // (including the `$set_once` person-properties bag) and may return null to drop it.
  before_send: scrubEvent,
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
