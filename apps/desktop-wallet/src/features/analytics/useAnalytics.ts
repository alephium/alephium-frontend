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
