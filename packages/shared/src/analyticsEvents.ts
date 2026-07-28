// AUTO-ORGANISED analytics event catalog - the single source of truth for every event
// name emitted by the desktop and mobile wallets.
//
// RULES:
//  - A value is the exact string sent to PostHog. Changing a value SPLITS that event's
//    history in PostHog, so treat values as immutable once shipped.
//  - SHARED + UNIFIED events use one constant across both apps and can be funnelled together
//    directly. UNIFIED are the canonical cross-platform names introduced on 2026-07-06 - see
//    docs/analytics-events-migration.md for the old→new mapping and how to bridge the history
//    split with a PostHog Action.
//  - DESKTOP-only / MOBILE-only events have no cross-platform twin and keep their legacy names.
//  - `Transaction Approved` and `Transaction Rejected` carry a `tx_type` prop (contract_call |
//    deploy | unsigned | transfer | chained | message | consolidate) instead of a separate event
//    per type. `message` and `consolidate` only ever appear on the rejection side: their approvals
//    predate the prop and keep their own events, `Message Signed` and `Consolidated UTXOs`.
//  - The `event` argument of `sendAnalytics` is typed as `AnalyticsEventName`, so only
//    values from this catalog can be captured.
//  - ONE EXCEPTION, and it is not capturable here: the mobile wallet runs posthog-react-native with
//    `captureAppLifecycleEvents`, so the SDK itself emits `Application Installed`, `Application
//    Updated`, `Application Opened`, `Application Became Active` and `Application Backgrounded`.
//    Those names are owned by the SDK - PostHog's session, retention and stickiness tooling keys off
//    them, so they cannot be renamed into this catalog. `Application Installed` never actually fires,
//    because opt-in necessarily post-dates install detection.

export const AnalyticsEvent = {
  // ── SHARED (identical string in both apps - funnel-ready) ───────
  // These five shipped on desktop first and mobile adopted the exact desktop string rather than a
  // tidier one, because the desktop history is years deep and a rename would have split it.
  CHANGED_FIAT_CURRENCY: 'Changed fiat currency',
  CHANGED_LANGUAGE: 'Changed language',
  CHANGED_NETWORK: 'Changed network',
  CHANGED_THEME: 'Changed theme',
  WALLET_SWITCHED: 'Wallet switched',

  CONSOLIDATED_UTXOS: 'Consolidated UTXOs',
  DELETED_WALLET: 'Deleted wallet',
  DISABLED_ANALYTICS: 'Disabled analytics',
  ENABLED_ANALYTICS: 'Enabled analytics',
  ERROR: 'Error',
  REGION_CHANGED: 'Region changed',
  SAVED_CUSTOM_NETWORK_SETTINGS: 'Saved custom network settings',
  WC_DISCONNECTED_FROM_DAPP: 'WC: Disconnected from dApp',

  // ── UNIFIED (canonical cross-platform names - added 2026-07-06; see docs/analytics-events-migration.md) ──
  // Fired when the user enters the create / import / watch-only flow, carrying a `method` prop. This
  // is the funnel entry point: without it, `Wallet Created` has no denominator and onboarding
  // completion rate cannot be computed on either platform.
  ONBOARDING_STARTED: 'Onboarding Started',
  // Mobile only: desktop's onboarding is one form with no intermediate steps.
  ONBOARDING_STEP_VIEWED: 'Onboarding Step Viewed',
  WALLET_CREATED: 'Wallet Created',
  WALLET_IMPORTED: 'Wallet Imported',
  WALLET_UNLOCKED: 'Wallet Unlocked',
  WALLET_NAME_EDITED: 'Wallet Name Edited',
  ADDRESS_CREATED: 'Address Created',
  ADDRESS_SETTINGS_EDITED: 'Address Settings Edited',
  CONTACT_CREATED: 'Contact Created',
  CONTACT_EDITED: 'Contact Edited',
  CONTACT_DELETED: 'Contact Deleted',
  TOKEN_HIDDEN: 'Token Hidden',
  PUBLIC_KEY_COPIED: 'Public Key Copied',
  SEND_BUTTON_CLICKED: 'Send Button Clicked',
  TRANSACTION_SENT: 'Transaction Sent',
  TRANSACTION_APPROVED: 'Transaction Approved',
  MESSAGE_SIGNED: 'Message Signed',
  // Transport-agnostic on purpose: a dApp connection happens either over WalletConnect or through the
  // mobile in-app browser, and the `origin` prop says which. Naming them 'WalletConnect ...' would
  // have meant the in-app browser (the primary surface on mobile) either went untracked or was
  // recorded under a name that is simply untrue.
  DAPP_CONNECTION_REQUESTED: 'dApp Connection Requested',
  DAPP_CONNECTED: 'dApp Connected',
  SEND_DESTINATION_SET: 'Send Destination Set',
  SEND_AMOUNT_SET: 'Send Amount Set',
  SEND_REVIEW_REACHED: 'Send Review Reached',
  TRANSACTION_FAILED: 'Transaction Failed',
  WALLET_FUNDED: 'Wallet Funded',
  RECEIVE_ADDRESS_COPIED: 'Receive Address Copied',
  // Mobile only. Desktop's equivalent toggle keeps its shipped `Enabled/Disabled password requirement`
  // names, because renaming them would split their history.
  AUTHENTICATION_SETTINGS_CHANGED: 'Authentication Settings Changed',
  // The denominator `Transaction Approved` never had. Carries the same `tx_type` so approve and reject
  // can be summed into a request count and divided into an approval rate.
  TRANSACTION_REJECTED: 'Transaction Rejected',
  TRANSACTION_DETAILS_OPENED: 'Transaction Details Opened',
  NFT_DETAILS_OPENED: 'NFT Details Opened',
  DISCREET_MODE_TOGGLED: 'Discreet Mode Toggled',

  // ── DESKTOP wallet ──────────────────────────────────────────────
  ADDRESS_ORDER_CHANGED: 'Address order changed',
  ADDRESS_SETTINGS_BUTTON_CLICKED: 'Address settings button clicked',
  ADVANCED_OPERATION_TO_CONSOLIDATE_UTXOS_CLICKED: 'Advanced operation to consolidate UTXOs clicked',
  ADVANCED_OPERATION_TO_DELETE_ADDRESSES_CLICKED: 'Advanced operation to delete addresses clicked',
  ADVANCED_OPERATION_TO_DISCOVER_ADDRESSES_CLICKED: 'Advanced operation to discover addresses clicked',
  ADVANCED_OPERATION_TO_GENERATE_ONE_ADDRESS_PER_GROUP_CLICKED:
    'Advanced operation to generate one address per group clicked',
  ADVANCED_OPERATION_TO_SHARE_IDEAS_CLICKED: 'Advanced operation to share ideas clicked',
  AUTO_UPDATE_MODAL_CLICKED_DOWNLOAD: 'Auto-update modal: Clicked "Download"',
  AUTO_UPDATE_MODAL_CLICKED_RESTART: 'Auto-update modal: Clicked "Restart"',
  AUTO_UPDATE_MODAL_CLOSED: 'Auto-update modal: Closed',
  CHANGED_DEFAULT_ADDRESS: 'Changed default address',
  CHANGED_NETWORK_FROM_APP_HEADER: 'Changed network from app header',
  CHANGED_WALLET_LOCK_TIME: 'Changed wallet lock time',
  COPIED_ADDRESS_PRIVATE_KEY: 'Copied address private key',
  COULD_NOT_BUILD_TX_CONSOLIDATION_REQUIRED: 'Could not build tx, consolidation required',
  CREATING_WALLET_CREATING_PASSWORD_CLICKED_BACK: 'Creating wallet: Creating password: Clicked back',
  CREATING_WALLET_CREATING_PASSWORD_CLICKED_NEXT: 'Creating wallet: Creating password: Clicked next',
  CREATING_WALLET_READY_TO_VERIFY_WORDS_CLICKED_BACK: 'Creating wallet: Ready to verify words: Clicked back',
  CREATING_WALLET_READY_TO_VERIFY_WORDS_CLICKED_NEXT: 'Creating wallet: Ready to verify words: Clicked next',
  CREATING_WALLET_VERIFYING_WORDS_CLICKED_BACK: 'Creating wallet: Verifying words: Clicked back',
  CREATING_WALLET_VERIFYING_WORDS_COMPLETED: 'Creating wallet: Verifying words: Completed',
  CREATING_WALLET_WRITING_DOWN_MNEMONIC_CLICKED_BACK: 'Creating wallet: Writing down mnemonic: Clicked back',
  CREATING_WALLET_WRITING_DOWN_MNEMONIC_CLICKED_NEXT: 'Creating wallet: Writing down mnemonic: Clicked next',
  DISABLED_PASSWORD_REQUIREMENT: 'Disabled password requirement',
  ENABLED_DEV_TOOLS: 'Enabled dev tools',
  ENABLED_PASSWORD_REQUIREMENT: 'Enabled password requirement',
  EXPORTED_CSV: 'Exported CSV',
  IMPORTING_WALLET_ENTERING_WORDS_CLICKED_NEXT: 'Importing wallet: Entering words: Clicked next',
  LOCKED_WALLET: 'Locked wallet',
  NEW_ADDRESS_CREATED_THROUGH_WALLETCONNECT_MODAL: 'New address created through WalletConnect modal',
  ONE_ADDRESS_PER_GROUP_GENERATED: 'One address per group generated',
  RECEIVE_BUTTON_CLICKED: 'Receive button clicked',
  REJECTED_WALLETCONNECT_CONNECTION_BY_CLICKING_REJECT: 'Rejected WalletConnect connection by clicking "Reject"',
  REJECTED_WALLETCONNECT_CONNECTION_BY_CLICKING_DECLINE: 'Rejected WalletConnect connection by clicking Decline',
  REJECTED_WALLETCONNECT_CONNECTION_BY_CLOSING_MODAL: 'Rejected WalletConnect connection by closing modal',
  REQUESTED_TESTNET_TOKENS: 'Requested testnet tokens',
  SWEPT_ADDRESS_ASSETS: 'Swept address assets',
  WALLET_SETTINGS_BUTTON_CLICKED: 'Wallet settings button clicked',

  // ── MOBILE wallet ───────────────────────────────────────────────
  ACTION_CARD_PRESSED_BTN_TO_BUY: 'Action card: Pressed btn to buy',
  ACTION_CARD_PRESSED_BTN_TO_RECEIVE_FUNDS_TO: 'Action card: Pressed btn to receive funds to',
  ACTION_CARD_PRESSED_BTN_TO_SWAP: 'Action card: Pressed btn to swap',
  ACTIVATED_BIOMETRICS_FROM_WALLET_CREATION_FLOW: 'Activated biometrics from wallet creation flow',
  ADDED_DAPP_TO_FAVORITES: 'Added dApp to favorites',
  APP_CACHE_CLEARED: 'App Cache Cleared',
  // Seconds, and mobile-specific on purpose: desktop's `Changed wallet lock time` carries minutes with
  // null for never, mobile carries seconds with -1 for never. Same concept, incompatible units - one
  // event would average the two into a number that means nothing.
  AUTO_LOCK_CHANGED: 'Auto Lock Changed',
  // Backup funnel, in order: Backup Reminder Shown -> Backup Reminder Accepted -> Backup Intro Shown
  // -> Recovery Phrase Shown -> Mnemonic Verification Started -> Backed-up mnemonic. The intro screen
  // stays mounted as the flow moves forward, so `Backup Intro Shown` fires once per entry; stepping
  // back to it re-pushes the later screens, so `Recovery Phrase Shown` and `Mnemonic Verification
  // Started` fire again. Every step here is subject to `throttleEvent`, which drops a repeat carrying
  // identical props within 5s, so read all of them per user rather than as counts. `Mnemonic
  // Verification Abandoned` therefore means "left the verification screen unfinished", not "gave up":
  // the return leg is `Mnemonic Verification Started` with `resumed: true`.
  // No entry-point prop on `Backup Intro Shown`: `Backup Reminder Accepted`, `Backup Notification
  // Pressed` and `Getting Started Item Pressed` already fire on the press that navigates, so split the
  // funnel by those. Only the fund-password settings row enters unattributed.
  BACKED_UP_MNEMONIC: 'Backed-up mnemonic',
  BACKUP_EXIT_PROMPT_ANSWERED: 'Backup Exit Prompt Answered',
  BACKUP_INTRO_SHOWN: 'Backup Intro Shown',
  BACKUP_REMINDER_ACCEPTED: 'Backup Reminder Accepted',
  BACKUP_REMINDER_DISMISSED: 'Backup Reminder Dismissed',
  BACKUP_REMINDER_SHOWN: 'Backup Reminder Shown',
  // The provider's success redirect, not a settled purchase. A bank transfer clears days later and
  // nothing reports that back.
  BUY_COMPLETED: 'Buy Completed',
  BUY_DISCLAIMER_SHOWN: 'Buy Disclaimer Shown',
  BUY_PROVIDER_OPENED: 'Buy Provider Opened',
  CAPTURED_CONTACT_ADDRESS_BY_SCANNING_QR_CODE_FROM_DASHBOARD:
    'Captured contact address by scanning QR code from Dashboard',
  CLICKED_ON_BUTTON_TO_ADD_AN_ASSET_TO_HIDDEN_LIST: 'Clicked on button to add an asset to hidden list',
  CLICKED_ON_BUTTON_TO_UNHIDE_AN_ASSET: 'Clicked on button to unhide an asset',
  CONTACT_CAPTURED_NEW_CONTACT_ADDRESS_BY_SCANNING_QR_CODE: 'Contact: Captured new contact address by scanning QR code',
  CONTACT_SHARED_CONTACT: 'Contact: Shared contact',
  CONTACT_TRIED_TO_ADD_AN_EXISTING_CONTACT_BY_SCANNING_QR_CODE:
    'Contact: Tried to add an existing contact by scanning QR code',
  CONTINUED_ADDRESS_DISCOVERY: 'Continued address discovery',
  COPIED_ADDRESS: 'Copied address',
  BACKUP_NOTIFICATION_PRESSED: 'Backup Notification Pressed',
  GETTING_STARTED_SHOWN: 'Getting Started Shown',
  GETTING_STARTED_ITEM_PRESSED: 'Getting Started Item Pressed',
  GETTING_STARTED_DISMISSED: 'Getting Started Dismissed',
  GETTING_STARTED_COMPLETED: 'Getting Started Completed',
  CREATED_FUND_PASSWORD: 'Created fund password',
  CREATED_WATCH_ONLY_WALLET: 'Created watch-only wallet',
  DELETED_ADDRESS: 'Deleted address',
  DELETED_FUND_PASSWORD: 'Deleted fund password',
  EXECUTED_SWAP: 'Executed swap',
  // Swap funnel (mobile). ACTION_CARD_PRESSED_BTN_TO_SWAP is the entry; EXECUTED_SWAP is the broadcast.
  SWAP_AMOUNT_SET: 'Swap Amount Set',
  SWAP_INITIATED: 'Swap Initiated',
  SWAP_QUOTE_FAILED: 'Swap Quote Failed',
  SWAP_CONFIRMED: 'Swap Confirmed',
  SWAP_REVERTED: 'Swap Reverted',
  SWAP_FAILED: 'Swap Failed',
  // Staking funnel (mobile). One funnel across stake / unstake / claim / cancel, split by `action`.
  STAKE_INITIATED: 'Stake Initiated',
  STAKE_EXECUTED: 'Stake Executed',
  STAKE_CONFIRMED: 'Stake Confirmed',
  STAKE_FAILED: 'Stake Failed',
  IMPORTED_DISCOVERED_ADDRESSES: 'Imported discovered addresses',
  MNEMONIC_MIGRATED: 'Mnemonic migrated',
  MNEMONIC_VERIFICATION_ABANDONED: 'Mnemonic Verification Abandoned',
  MNEMONIC_VERIFICATION_STARTED: 'Mnemonic Verification Started',
  MULTI_WALLET_MIGRATION_COMPLETED: 'Multi-wallet migration completed',
  NFT_GRID_OPENED: 'NFT Grid Opened',
  // Counts how many times connectivity broke, not how long it stayed broken: it fires on entering
  // an offline state and again only if the affected service changes.
  OFFLINE_DETECTED: 'Offline Detected',
  OPENED_ADDRESS_QUICK_ACTIONS_MODAL: 'Opened address quick actions modal',
  OPENED_DAPP: 'Opened dApp',
  OPENED_DAPP_DETAILS_MODAL: 'Opened dApp details modal',
  OPENED_FAVORITE_CUSTOM_DAPP: 'Opened favorite custom dApp',
  OPENED_TOKEN_DETAILS_MODAL: 'Opened token details modal',
  OPENED_TOKEN_QUICK_ACTIONS_MODAL: 'Opened token quick actions modal',
  // One event for every option inside the long-hold quick action modals, split by `quick_action`.
  // The alternative was nine events that no single breakdown could compare.
  QUICK_ACTION_PRESSED: 'Quick Action Pressed',
  RECOVERY_PHRASE_AUTH_FAILED: 'Recovery Phrase Auth Failed',
  RECOVERY_PHRASE_SHOWN: 'Recovery Phrase Shown',
  RECREATED_MISSING_WALLET_METADATA_FOR_EXISTING_WALLET: 'Recreated missing wallet metadata for existing wallet',
  REMOVED_DAPP_TO_FAVORITES: 'Removed dApp to favorites',
  SCANNED_ETHEREUM_ADDRESS: 'Scanned Ethereum address',
  SCANNED_QR_CODE_FROM_DESKTOP_WALLET: 'Scanned QR code from desktop wallet',
  SCANNED_INVALID_ADDRESS: 'Scanned invalid address',
  SEND_CAPTURED_DESTINATION_ADDRESS_BY_SCANNING_QR_CODE: 'Send: Captured destination address by scanning QR code',
  SEND_CAPTURED_DESTINATION_ADDRESS_BY_SCANNING_QR_CODE_FROM_DASHBOARD:
    'Send: Captured destination address by scanning QR code from Dashboard',
  SEND_SELECTED_CONTACT_TO_SEND_FUNDS_TO: 'Send: Selected contact to send funds to',
  SEND_SELECTED_OWN_ADDRESS_TO_SEND_FUNDS_TO: 'Send: Selected own address to send funds to',
  SET_ADDRESS_AS_DEFAULT: 'Set address as default',
  SKIPPED_BIOMETRICS_ACTIVATION_FROM_WALLET_CREATION_FLOW: 'Skipped biometrics activation from wallet creation flow',
  STARTED_ADDRESS_DISCOVERY_FROM_SETTINGS: 'Started address discovery from settings',
  STOPPED_ADDRESS_DISCOVERY: 'Stopped address discovery',
  UPDATED_FUND_PASSWORD: 'Updated fund password',
  USER_IDENTIFIED: 'User identified',
  WC_CONNECTED_BY_MANUALLY_PASTING_URI: 'WC: Connected by manually pasting URI',
  WC_SCANNED_WC_QR_CODE: 'WC: Scanned WC QR code',
  WC_SWITCHED_SIGNER_ADDRESS: 'WC: Switched signer address',
  DAPP_AUTHORIZATION_REVOKED: 'dApp Authorization Revoked',
  DAPP_BROWSER_ACTION_PRESSED: 'dApp Browser Action Pressed',
  // A dApp asked to switch network and the user said no, which fails the connection. The accepting
  // side is `Changed network` with `origin: connect_dapp_modal`.
  DAPP_NETWORK_SWITCH_DECLINED: 'dApp Network Switch Declined',
  DAPP_HOST_MISMATCH_DETECTED: 'dApp host mismatch detected'
} as const

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]
