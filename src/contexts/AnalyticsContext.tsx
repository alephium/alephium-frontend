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
import { ReactNode, useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { analyticsIdGenerated } from '~/store/settingsSlice'

const PUBLIC_POSTHOG_KEY = 'phc_CGYfA9jfoeMKXW629pQs1vwI1hxD3icXgnTDezOhaGz'
const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com'

const AnalyticsSetup = ({ children }: { children: ReactNode }) => {
  const posthog = usePostHog()
  const analytics = useAppSelector((s) => s.settings.analytics)
  const analyticsId = useAppSelector((s) => s.settings.analyticsId)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!settingsLoadedFromStorage) {
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
  }, [analytics, analyticsId, dispatch, posthog, settingsLoadedFromStorage])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>
}

const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useAppSelector((s) => s.settings.analytics)
  const analyticsId = useAppSelector((s) => s.settings.analyticsId)
  const settingsLoadedFromStorage = useAppSelector((s) => s.settings.loadedFromStorage)

  return (
    <PostHogProvider
      apiKey={PUBLIC_POSTHOG_KEY}
      options={{
        host: PUBLIC_POSTHOG_HOST,
        disableGeoip: true,
        enable: settingsLoadedFromStorage && analytics && !!analyticsId
      }}
      autocapture={{
        captureTouches: false
      }}
    >
      <AnalyticsSetup>{children}</AnalyticsSetup>
    </PostHogProvider>
  )
}

export default AnalyticsProvider
