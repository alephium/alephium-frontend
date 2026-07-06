import {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsProps,
  cleanExceptionMessage,
  getHumanReadableError,
  redactSensitiveData,
  throttleEvent
} from '@alephium/shared'
import { CaptureOptions } from 'posthog-js'
import { usePostHog } from 'posthog-js/react'
import { useCallback } from 'react'

type EventAnalyticsParams = {
  event: AnalyticsEventName
  type?: 'event'
  props?: AnalyticsProps
  options?: CaptureOptions
}

type ErrorAnalyticsParams = {
  type: 'error'
  message: string
  error?: unknown
  isSensitive?: boolean
  category?: string
}

type AnalyticsParams = EventAnalyticsParams | ErrorAnalyticsParams

const useAnalytics = (): { sendAnalytics: (params: AnalyticsParams) => void } => {
  const posthog = usePostHog()

  const sendAnalytics = useCallback(
    (params: AnalyticsParams) => {
      if (params.type === 'error') {
        const { error, message, isSensitive, category } = params
        console.error(message, error)

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

        throttleEvent(() => posthog.capture(event, props, options), event, props)
      }
    },
    [posthog]
  )

  return { sendAnalytics }
}

export default useAnalytics
