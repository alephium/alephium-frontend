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

import { AnalyticsProps, cleanExceptionMessage, getHumanReadableError, throttleEvent } from '@alephium/shared'
import { CaptureOptions } from 'posthog-js'
import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

type EventAnalyticsParams = {
  event: string
  type?: 'event'
  props?: AnalyticsProps
  options?: CaptureOptions
}

type ErrorAnalyticsParams = {
  type: 'error'
  message: string
  error?: unknown
  isSensitive?: boolean
}

type AnalyticsParams = EventAnalyticsParams | ErrorAnalyticsParams

const useAnalytics = (): { sendAnalytics: (params: AnalyticsParams) => void } => {
  const posthog = usePostHog()

  const sendAnalytics = useCallback(
    (params: AnalyticsParams) => {
      if (params.type === 'error') {
        const { error, message, isSensitive } = params
        console.error(message, error)

        sendAnalytics({
          event: 'Error',
          props: {
            message,
            reason: error ? (isSensitive ? cleanExceptionMessage(error) : getHumanReadableError(error, '')) : undefined
          }
        })
      } else {
        const { event, props, options } = params

        throttleEvent(() => posthog.capture(event, props, options), event, props)
      }
    },
    [posthog]
  )

  return { sendAnalytics }
}

export default useAnalytics
