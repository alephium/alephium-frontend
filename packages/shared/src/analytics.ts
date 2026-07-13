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
// The UI surface an action was triggered from. A closed union so the same surface cannot be
// spelled two ways: desktop used to send `token_details` where mobile sent `tokenDetails` for the
// identical screen, which made `origin` breakdowns incomparable across the two apps - the exact
// thing the unified event catalog exists to enable. All values are snake_case.
export type AnalyticsOrigin =
  // Screens
  | 'dashboard' // mobile home
  | 'overview_page' // desktop home
  | 'address_details'
  | 'token_details'
  | 'addresses_screen'
  | 'staking'
  | 'contact'
  // Components and surfaces
  | 'quick_actions'
  | 'address_settings'
  | 'app_settings'
  | 'dapp_card'
  | 'token_list_item'
  | 'hidden_assets_list_item'
  | 'send_modal'
  | 'qr_code_scan'
  | 'origin_address'
  | 'destination_address'
  | 'select_address_modal'
  | 'connect_dapp_modal'
  | 'walletconnect_pairing'
  | 'settings'
  | 'notifications'
  | 'auto_lock'
  // dApp entry points. The `:insufficient_funds` suffix marks the failure variant of the flow.
  | 'walletconnect'
  | 'walletconnect:insufficient_funds'
  | 'in_app_browser'
  | 'in_app_browser:insufficient_funds'

export type AnalyticsProps = {
  // Which UI surface the action was triggered from.
  origin?: AnalyticsOrigin
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
  token_id?: string
  claimed_host?: string
  from_version?: string
  to_version?: string

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
