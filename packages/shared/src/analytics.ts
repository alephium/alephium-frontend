const eventThrottleStatus: Record<string, boolean> = {}

const ANALYTICS_THROTTLING_TIMEOUT = 5000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnalyticsProps = { [key: string]: any }

export const throttleEvent = (callback: () => void, event: string, props?: AnalyticsProps) => {
  const eventKey = `${event}:${props ? Object.keys(props).map((key) => `${key}:${props[key]}`) : ''}`

  if (!eventThrottleStatus[eventKey]) {
    eventThrottleStatus[eventKey] = true

    setTimeout(() => {
      eventThrottleStatus[eventKey] = false
    }, ANALYTICS_THROTTLING_TIMEOUT)

    callback()
  }
}
