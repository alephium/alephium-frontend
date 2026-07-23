import { getDappHost } from './utils/dApps'

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

// Set at the send entry point and carried unchanged through every send funnel event, so the funnel can
// be broken down by where the send began.
export type SendOrigin = Extract<
  AnalyticsOrigin,
  'dashboard' | 'overview_page' | 'address_details' | 'token_details' | 'contact' | 'qr_code_scan'
>

export type BuyOrigin = Extract<AnalyticsOrigin, 'dashboard' | 'address_details' | 'token_details'>

// No `intro` step: `Onboarding Started` already fires on the press that navigates there. No
// address-discovery step: `Wallet Imported` fires before that screen.
export type OnboardingStep = 'name' | 'import_method' | 'seed_entry' | 'qr_decrypt'

export type GettingStartedItem = 'backup' | 'receive_funds' | 'biometrics'

export type AnalyticsProps = {
  // Which UI surface the action was triggered from.
  origin?: AnalyticsOrigin
  from?: string

  // dApp identity, carried by every approval, message-signing and dApp-open event so that on-chain
  // activity can be attributed back to the dApp that requested it. Pass whatever URL or host you have
  // - it is normalised to a bare host by `normalizeAnalyticsProps` before capture, see below.
  dapp_host?: string
  dapp_name?: string

  // On `Transaction Approved`, which collapses the eight former per-type approval events.
  tx_type?: 'contract_call' | 'deploy' | 'unsigned' | 'transfer' | 'chained'

  // On `Transaction Failed`.
  failure_reason?: 'insufficient_balance' | 'build_error' | 'submit_error'

  // Third-party service behind a Buy or Swap action.
  provider?: string

  // On `Onboarding Started` and `Onboarding Step Viewed`: which flow the user entered.
  method?: 'create' | 'import' | 'watch_only'

  // On `Onboarding Step Viewed`.
  step?: OnboardingStep

  // On `Getting Started Item Pressed`.
  checklist_item?: GettingStartedItem

  // A per-install creation counter, deliberately not the wallet id: it answers first-vs-subsequent
  // without putting a stable per-wallet key on the wire.
  wallet_ordinal?: number

  is_new_wallet?: boolean
  is_funded?: boolean
  words_completed?: number
  words_total?: number

  // On `Authentication Settings Changed`.
  setting?: 'app_access' | 'transactions'
  enabled?: boolean

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

  // PostHog special property: `$set` carries person properties on `User identified`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $set?: Record<string, any>
}

// Applied centrally in each app's `sendAnalytics` rather than at the ~20 emit sites, so a new call
// site cannot reintroduce the inconsistency by passing a raw URL.
export const normalizeAnalyticsProps = (props?: AnalyticsProps): AnalyticsProps | undefined =>
  props?.dapp_host ? { ...props, dapp_host: getDappHost(props.dapp_host) } : props

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
