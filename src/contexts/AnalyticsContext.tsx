/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { nanoid } from 'nanoid'
import { PostHogProvider, usePostHog } from 'posthog-react-native'
import { useCallback, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { analyticsIdGenerated } from '~/store/settingsSlice'

const PUBLIC_POSTHOG_KEY = 'phc_pDAhdhvfHzZTljrFyr1pysqdkEFIQeOHqiiRHsn4mO'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

const AnalyticsSetup = ({ children }: { children: JSX.Element }) => {
  const posthog = usePostHog()
  const analytics = useAppSelector((s) => s.settings.analytics)
  const analyticsId = useAppSelector((s) => s.settings.analyticsId)
  const usesBiometrics = useAppSelector((s) => s.settings.usesBiometrics)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const requireAuth = useAppSelector((s) => s.settings.requireAuth)
  const theme = useAppSelector((s) => s.settings.theme)
  const currency = useAppSelector((s) => s.settings.currency)
  const networkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()

  const shouldOptOut = !settingsLoadedFromStorage || __DEV__
  const canCaptureUserProperties = !shouldOptOut && analytics && !!analyticsId

  useEffect(() => {
    if (shouldOptOut) {
      posthog?.optOut()
      return
    }

    if (analytics && analyticsId) {
      posthog?.identify(analyticsId)
      posthog?.optIn()
    } else if (!analytics && analyticsId) {
      posthog?.optOut()
    } else if (!analyticsId) {
      const newAnalyticsId = nanoid()
      dispatch(analyticsIdGenerated(newAnalyticsId))
    }
  }, [analytics, analyticsId, dispatch, posthog, shouldOptOut])

  const captureUserProperties = useCallback(async () => {
    if (!canCaptureUserProperties) return

    posthog?.capture('User identified', {
      $set: {
        requireAuth,
        theme,
        currency,
        networkName,
        analytics,
        usesBiometrics
      }
    })
  }, [analytics, canCaptureUserProperties, currency, networkName, posthog, requireAuth, theme, usesBiometrics])

  useEffect(() => {
    if (canCaptureUserProperties) captureUserProperties()
  }, [canCaptureUserProperties, captureUserProperties])

  return children
}

const AnalyticsProvider = ({ children }: { children: JSX.Element }) => (
  <PostHogProvider
    apiKey={PUBLIC_POSTHOG_KEY}
    options={{
      host: PUBLIC_POSTHOG_HOST,
      disableGeoip: true,
      customAppProperties: (properties) => ({ ...properties, $ip: '', $timezone: '' })
    }}
    autocapture={{
      captureTouches: false,
      captureLifecycleEvents: false,
      captureScreens: false
    }}
  >
    <AnalyticsSetup>{children}</AnalyticsSetup>
  </PostHogProvider>
)

export default AnalyticsProvider
