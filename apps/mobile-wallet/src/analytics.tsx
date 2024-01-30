/*
Copyright 2018 - 2024 The Alephium Authors
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
import PostHog from 'posthog-react-native'
import { PosthogCaptureOptions } from 'posthog-react-native/lib/posthog-core/src'
import { useCallback, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { analyticsIdGenerated } from '~/store/settingsSlice'

const PUBLIC_POSTHOG_KEY = 'phc_pDAhdhvfHzZTljrFyr1pysqdkEFIQeOHqiiRHsn4mO'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

export const posthogAsync: Promise<PostHog> = PostHog.initAsync(PUBLIC_POSTHOG_KEY, {
  host: PUBLIC_POSTHOG_HOST,
  disableGeoip: true,
  customAppProperties: (properties) => ({ ...properties, $ip: '', $timezone: '' }),
  captureNativeAppLifecycleEvents: false
})

// Is there a better way to get the types of the arguments of the capture function of the abstract PostHogCore class
// from posthog-react-native/lib/posthog-core/src?
export const sendAnalytics = (
  event: string,
  properties?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  },
  options?: PosthogCaptureOptions
) => posthogAsync.then((client) => client.capture(event, properties, options))

export const Analytics = ({ children }: { children: JSX.Element }) => {
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
      posthogAsync.then((client) => client.optOut())
      return
    }

    if (analytics && analyticsId) {
      posthogAsync.then((client) => {
        client.identify()
        client.optIn()
      })
    } else if (!analytics && analyticsId) {
      posthogAsync.then((client) => client.optOut())
    } else if (!analyticsId) {
      const newAnalyticsId = nanoid()
      dispatch(analyticsIdGenerated(newAnalyticsId))
    }
  }, [analytics, analyticsId, dispatch, shouldOptOut])

  const captureUserProperties = useCallback(async () => {
    if (!canCaptureUserProperties) return

    sendAnalytics('User identified', {
      $set: {
        requireAuth,
        theme,
        currency,
        networkName,
        analytics,
        usesBiometrics
      }
    })
  }, [analytics, canCaptureUserProperties, currency, networkName, requireAuth, theme, usesBiometrics])

  useEffect(() => {
    if (canCaptureUserProperties) captureUserProperties()
  }, [canCaptureUserProperties, captureUserProperties])

  return children
}
