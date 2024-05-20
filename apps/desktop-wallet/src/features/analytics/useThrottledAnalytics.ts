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

import { getHumanReadableError } from '@alephium/shared'
import { CaptureOptions } from 'posthog-js'
import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

const eventThrottleStatus: Record<string, boolean> = {}

const useThrottledAnalytics = () => {
  const posthog = usePostHog()

  const sendAnalytics = useCallback(
    (
      event: string,
      props?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any
      },
      options?: CaptureOptions
    ) => {
      const eventKey = `${event}:${props ? Object.keys(props).map((key) => `${key}:${props[key]}`) : ''}`

      if (!eventThrottleStatus[eventKey]) {
        posthog.capture(event, props, options)
        eventThrottleStatus[eventKey] = true

        setTimeout(() => {
          eventThrottleStatus[eventKey] = false
        }, 5000)
      }
    },
    [posthog]
  )

  const sendErrorAnalytics = useCallback(
    (error: unknown, message: string, skipException?: boolean) => {
      console.error(message, error)

      sendAnalytics('Error', {
        message,
        reason: skipException ? undefined : getHumanReadableError(error, '')
      })
    },
    [sendAnalytics]
  )

  return {
    sendAnalytics,
    sendErrorAnalytics
  }
}

export default useThrottledAnalytics
