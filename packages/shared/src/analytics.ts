const eventThrottleStatus: Record<string, boolean> = {}

const ANALYTICS_THROTTLING_TIMEOUT = 5000

// The properties that may accompany an analytics event.
//
// This is a CLOSED shape on purpose: with no index signature, TypeScript's excess-property check
// rejects a misspelled or off-convention key at the call site. The index signature this replaced
// let `dAppUrl` / `dAppName` ship alongside `dapp_url` / `dapp_name`, silently splitting one
// concept across two PostHog properties and breaking every breakdown that relied on them.
//
// A key is the exact string sent to PostHog, so renaming one splits that property's history the
// same way renaming an event does. Treat keys as immutable once shipped. The existing keys below
// are a mix of conventions for that reason; new keys should be snake_case, like the event catalog
// in analyticsEvents.ts. Adding a key here is the only way to start sending it.
export type AnalyticsProps = {
  // Which UI surface the action was triggered from.
  origin?: string
  from?: string

  // dApp identity, carried by every approval, message-signing and dApp-open event so that on-chain
  // activity can be attributed back to the dApp that requested it.
  dapp_url?: string
  dapp_name?: string

  // On `Transaction Approved`, which collapses the eight former per-type approval events.
  tx_type?: 'contract_call' | 'deploy' | 'unsigned' | 'transfer' | 'chained'

  // Third-party service behind a Buy or Swap action.
  provider?: string

  // On the `Error` event.
  message?: string
  reason?: string
  category?: string

  // Settings.
  region?: string
  language?: string
  currency?: string
  theme?: string
  time?: number | null // wallet lock time in minutes; null means "never lock"
  time_period?: string
  network_name?: string
  value?: string

  // Lengths and counts rather than the values themselves, so user-chosen names never reach
  // analytics.
  wallet_name_length?: number
  label_length?: number
  contact_name_length?: number
  number_of_addresses?: number
  number_of_contacts?: number

  note?: string
  tokenId?: string
  claimedHost?: string
  fromVersion?: string
  toVersion?: string

  // PostHog special properties. `$ip` is set to '' to suppress IP capture; `$set` carries person
  // properties on `User identified`.
  $ip?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $set?: Record<string, any>
}

export const throttleEvent = (callback: () => void, event: string, props?: AnalyticsProps) => {
  const eventKey = `${event}:${props ? Object.entries(props).map(([key, value]) => `${key}:${value}`) : ''}`

  if (!eventThrottleStatus[eventKey]) {
    eventThrottleStatus[eventKey] = true

    setTimeout(() => {
      eventThrottleStatus[eventKey] = false
    }, ANALYTICS_THROTTLING_TIMEOUT)

    callback()
  }
}
