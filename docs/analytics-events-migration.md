# Analytics event migration (2026-07-06)

This is the mapping between the **old, divergent** analytics event names used by the desktop
and mobile wallets and the **new, unified** names in
[`packages/shared/src/analyticsEvents.ts`](../packages/shared/src/analyticsEvents.ts).

## Why

Before this change, the two wallets emitted different event names for the same user action
(e.g. `Sent transaction` on desktop vs `Send: Sent transaction` on mobile), which made
cross-platform funnels and dashboards impossible. All event names are now referenced through
a single typed catalog (`AnalyticsEvent`), and the divergent pairs have been unified to one
canonical `Object Action` name.

## History note (read this before comparing old vs new data)

Renaming an event **splits its history in PostHog**: events already ingested keep their old
name forever, and only clients running the new build emit the new name. Because wallet users
upgrade slowly, expect a **transition window** where both old and new names appear.

To analyse across the split, create a PostHog **Action** that ORs the old + new names (per the
tables below) and point insights/funnels at the Action - no data is lost, and no rename is
needed on the PostHog side. Events already under one shared name (see "Left unchanged") did
**not** change and need no bridging.

> **Actions bridge event names only.** There is no Action-equivalent for a renamed *property key*
> or *property value* - see "Property and value renames" below for how to bridge those (HogQL
> `coalesce`, applied per insight). Do not assume the Actions above cover the property work.

## Unified cross-platform pairs

| New unified event         | Old desktop event                   | Old mobile event                   |
| ------------------------- | ----------------------------------- | ---------------------------------- |
| `Wallet Created`          | `New wallet created`                | `Created new wallet`               |
| `Wallet Imported`         | `New wallet imported`               | `Imported wallet`                  |
| `Wallet Unlocked`         | `Wallet unlocked`                   | `Unlocked wallet`                  |
| `Wallet Name Edited`      | `Changed wallet name`               | `Wallet: Edited wallet name`       |
| `Address Created`         | `New address created`               | `Address: Generated new address`   |
| `Address Settings Edited` | `Changed address settings`          | `Address: Edited address settings` |
| `Contact Created`         | `Saved new contact`                 | `Contact: Created new contact`     |
| `Contact Edited`          | `Edited contact`                    | `Contact: Editted contact` (sic)   |
| `Contact Deleted`         | `Deleted contact`                   | `Contact: Deleted contact`         |
| `Token Hidden`            | `Hid token`                         | `Hid asset`                        |
| `Public Key Copied`       | `Copied address public key`         | `Copied public key`                |
| `Send Button Clicked`     | `Send button clicked`               | `Send button pressed`              |
| `Transaction Sent`        | `Sent transaction`                  | `Send: Sent transaction`           |
| `dApp Connected`          | `Approved WalletConnect connection` | `WC: Approved connection`          |
| `Message Signed`          | `Signed message`                    | `Approved message signing`         |

## Transaction-approval collapse

Eight separate dApp-approval events were collapsed into a single `Transaction Approved` event
with a `tx_type` property, so the whole class can be trended together and broken down by type.
The `origin` property is preserved where it existed.

| New event              | `tx_type`       | Old desktop event                           | Old mobile event               |
| ---------------------- | --------------- | ------------------------------------------- | ------------------------------ |
| `Transaction Approved` | `contract_call` | `Called smart contract`                     | `Approved contract call`       |
| `Transaction Approved` | `deploy`        | `Deployed smart contract`                   | `Approved contract deployment` |
| `Transaction Approved` | `unsigned`      | `Signed and submitted unsigned transaction` | `Approved unsigned tx`         |
| `Transaction Approved` | `transfer`      | - (see note)                                | `Approved transfer`            |
| `Transaction Approved` | `chained`       | `Approved chained tx`                       | `Approved chained tx`          |

**Note on `transfer`:** desktop never had a distinct dApp-transfer event - a WalletConnect
transfer is emitted as `Transaction Sent` with `origin: 'walletconnect'` (it used to be the
one-off `'wc'`; normalised here since the event is being renamed anyway, so no extra history
split). That behaviour is unchanged, so on desktop a dApp transfer still appears under
`Transaction Sent` (distinguishable by `origin`),
while on mobile it is `Transaction Approved` with `tx_type: 'transfer'`. Keep this asymmetry in
mind when comparing dApp-transfer volume across platforms.

## Property and value renames

Event names were not the only thing that diverged. Property **keys** and the values of the
`origin` property had drifted into three conventions (snake_case, camelCase, kebab-case), and in
several cases the *same concept* was spelled two ways - which silently splits it into two PostHog
properties and breaks any breakdown built on it. Both are now closed TypeScript unions in
[`packages/shared/src/analytics.ts`](../packages/shared/src/analytics.ts) (`AnalyticsProps` and
`AnalyticsOrigin`), so an off-convention key or value fails to compile rather than reaching PostHog.

### Property keys

| Concept              | Old key(s)                                        | New key                       |
| -------------------- | ------------------------------------------------- | ----------------------------- |
| dApp identity        | `dAppUrl` / `dapp_url`                            | `dapp_host` (see below)       |
| dApp name            | `dAppName` (on `Opened dApp`, `…dApp to favorites`) | `dapp_name`                 |
| Token                | `tokenId`                                         | `token_id`                    |
| Claimed host         | `claimedHost`                                     | `claimed_host`                |
| Auto-update versions | `fromVersion` / `toVersion`                       | `from_version` / `to_version` |

The `dAppUrl` / `dAppName` cases were bugs: the same event carried `dapp_url` from one code path
and `dAppUrl` from another, so no single breakdown ever saw all of its events.

### `dapp_host`: a dApp has ONE identity

`dapp_url` was renamed to `dapp_host` and its value is now normalised, because the smoke test on
2026-07-13 showed the funnel could not actually be joined. The same dApp arrived in three formats
depending on which code path emitted it:

| Event                     | Source                | Value observed             |
| ------------------------- | --------------------- | -------------------------- |
| `Opened dApp`             | `dApp.links.website`  | `https://app.linxlabs.org` |
| `dApp Connection Requested` | `senderHost`        | `app.linxlabs.org`         |
| `Transaction Approved`    | `senderHost`          | `app.linxlabs.org`         |

and separately `Opened dApp` for AlphPad produced `https://alphpad.com/`, with a trailing slash, so
the format was not even stable within a single event. Three different strings for one dApp means
`Opened dApp -> dApp Connected -> Transaction Approved` silently joins on nothing.

Every value now passes through `getDappHost()` (host, lowercased, no `www.`), which is the same
identity the wallet already uses to authorize a dApp - so analytics agrees with the security model
instead of inventing a second identity. Crucially the normalisation happens **centrally**, inside
each app's `sendAnalytics`, not at the ~20 emit sites: a new call site can pass a raw URL and still
cannot reintroduce the inconsistency.

### `origin` values

The important one: **desktop and mobile named the same surface differently** (`token_details` vs
`tokenDetails`, `address_details` vs `addressDetails`), so `origin` breakdowns could not be
compared across the two apps - defeating the point of the unified event names above. All values
are now snake_case.

| Old value(s)                                       | New value                          |
| -------------------------------------------------- | ---------------------------------- |
| `addressDetails` (mobile)                          | `address_details`                  |
| `tokenDetails` (mobile)                            | `token_details`                    |
| `qrCodeScan`                                       | `qr_code_scan`                     |
| `quickActions`                                     | `quick_actions`                    |
| `addressSettings`                                  | `address_settings`                 |
| `addressesScreen`                                  | `addresses_screen`                 |
| `originAddress`                                    | `origin_address`                   |
| `destinationAddress`                               | `destination_address`              |
| `walletConnectPairing`                             | `walletconnect_pairing`            |
| `selectAddressModal`                               | `select_address_modal`             |
| `connectDappModal`                                 | `connect_dapp_modal`               |
| `send-modal`                                       | `send_modal`                       |
| `in-app-browser`                                   | `in_app_browser`                   |
| `in-app-browser:insufficient-funds`                | `in_app_browser:insufficient_funds`|
| `walletconnect:insufficient-funds`                 | `walletconnect:insufficient_funds` |
| `wc` (desktop dApp transfer only)                  | `walletconnect`                    |
| `Auto lock`                                        | `auto_lock`                        |

### Bridging these in PostHog (there is no Action for this)

A PostHog Action ORs *event names*; it cannot union two property keys or two property values. To
analyse across a property split, use a **HogQL expression** in the insight's breakdown or filter
rather than the raw property:

```sql
-- dApp attribution across the key rename
coalesce(properties.dapp_url, properties.dAppUrl)

-- origin across the value rename (and the desktop/mobile casing split)
multiIf(
  properties.origin = 'tokenDetails',  'token_details',
  properties.origin = 'addressDetails', 'address_details',
  properties.origin = 'quickActions',   'quick_actions',
  properties.origin
)
```

This has to be applied per insight - there is no project-wide mapping - so keep the affected
insights listed below. Once the old builds have aged out of the reporting window, the `coalesce` /
`multiIf` wrappers can be dropped and the raw property used directly.

## Left unchanged (already shared, or single-platform)

- **Already shared** (identical string in both apps, so already funnel-ready - renaming would
  split history for no gain): `Consolidated UTXOs`, `Deleted wallet`, `Region changed`,
  `Saved custom network settings`, `WC: Disconnected from dApp`, `Error`.
- **Single-platform** events (no cross-platform twin to unify) keep their existing names - e.g.
  the desktop `Creating wallet: …` onboarding steps and the mobile `Action card: …`,
  `Opened dApp`, `Backed-up mnemonic`, etc.

## Affected saved insights

The exploratory funnels created on 2026-07-06 reference some renamed events
(`Send button pressed` → `Send Button Clicked`, `Sent transaction` → `Transaction Sent`,
`Created new wallet` → `Wallet Created`). After the renamed builds roll out they should be
repointed at PostHog Actions that OR the old + new names (see the history note above) to stay
continuous across the transition.

## Deferred: rename-proofing Actions + new-event insights (do at/after release)

Two follow-ups are intentionally deferred until the renamed builds ship **and** new events
start appearing in PostHog (creating them now would point at empty data):

1. **Bridge old → new names with PostHog Actions.** For each renamed pair in the tables above,
   create an Action that ORs the old and new names, then repoint the 4 exploratory funnels
   (created 2026-07-06) at those Actions so they stay continuous across the slow upgrade tail.
2. **Build insights on the new props/events** added in the 2026-07-06 instrumentation pass:
   `dapp_host` on all approval + message-signing events (dApp attribution), mobile
   `Wallet Unlocked` (biometric/app-resume path, previously untracked), and mobile
   `Disabled analytics` / `Enabled analytics` (mobile opt-out rate).

## Follow-ups

- **Post-release (needs new-event data):** save the Send funnel
  (`Send Button Clicked → Send Destination Set → Send Amount Set → Send Review Reached → Transaction Sent | Transaction Failed`),
  the Activation funnel (`Wallet Created → Wallet Funded → Transaction Sent`), and the dApp funnel
  (`WalletConnect Connection Requested → WalletConnect Connected`; plus `Opened dApp → Transaction Approved`
  joined on `dapp_host`).
- ~~**At release:** the rename-proofing Actions (event names).~~ **DONE 2026-07-13** - A bridging Action
  created per renamed event, in each project, named `<Unified Name> (bridged)`, each OR-ing the old name(s) with the new
  one. They were created *before* release on purpose: an Action can reference an event name that has
  no data yet, so pointing insights at them now means they stay continuous straight through the
  upgrade tail with no release-day scramble. Build every new insight against the Action, not the raw
  event.
- **At release:** the property/value bridging above (HogQL `coalesce` / `multiIf`). This is
  **separate work from the Actions** and easy to forget precisely because Actions do not cover it.
  It applies to any insight that breaks down or filters on `origin`, `dapp_host`, `dapp_name`,
  `token_id`, `claimed_host`, or `from_version` / `to_version`.
- **Optional now:** a Stickiness insight on `Wallet unlocked` (engagement-frequency distribution).

## Verifying the rollout (how we know the new data is better)

Concrete post-release checks, each of which fails loudly if instrumentation is wrong:

- **Property fill rate.** `dapp_host` should be set on ~100% of `Transaction Approved`.
  Anything materially lower means an emit site was missed.
- **Funnel monotonicity.** `Send Button Clicked` >= `Send Destination Set` >= `Send Amount Set` >=
  `Send Review Reached` >= `Transaction Sent`. An inversion means a double-fire or a path that
  skips a step.
- **Cross-platform reconciliation.** Mobile `Wallet Unlocked` per user should now be the same order
  of magnitude as desktop (previously it fired only on the PIN path, so it was drastically undercounted).
- **`origin` value set.** After the upgrade tail, the distinct values of `origin` should be exactly
  the `AnalyticsOrigin` union and nothing else. A stray camelCase value means a site was missed.

## dApp connections are transport-agnostic (`dApp Connection Requested` / `dApp Connected`)

A dApp connection happens over one of two transports: **WalletConnect** (both apps) or the **mobile
in-app browser** (Ecosystem tab). The smoke test on 2026-07-13 caught that connecting through the
in-app browser emitted **no event at all** - `ConnectDappModal` and `DappBrowserContext` had no
instrumentation - so the dApp funnel had a hole exactly where most mobile users connect. `Opened dApp`
fired, `Transaction Approved` would fire, and nothing in between.

Rather than fire an event called `WalletConnect Connected` for a connection that has nothing to do
with WalletConnect, the two events are named for the concept and carry the transport in `origin`:

| Event                       | `origin`                            | Fired from                               |
| --------------------------- | ----------------------------------- | ---------------------------------------- |
| `dApp Connection Requested` | `walletconnect` \| `in_app_browser` | the approval prompt is shown to the user |
| `dApp Connected`            | `walletconnect` \| `in_app_browser` | the user approves it                     |

Both carry `dapp_host` and `dapp_name`. Desktop has no in-app browser, so `origin` there is always
`walletconnect`.

Note the in-app browser silently re-connects a dApp the user has already authorized, without showing
the prompt. That path is deliberately **not** tracked: counting it would inflate connections and
produce a `dApp Connected` with no matching `dApp Connection Requested`, breaking the funnel.

The funnel is therefore
`Opened dApp -> dApp Connection Requested -> dApp Connected -> Transaction Approved`, joinable on
`dapp_host` and breakable down by `origin` to compare the two transports.

## Onboarding funnel entry point (`Onboarding Started`)

Neither app could compute an onboarding completion rate before this release: `Wallet Created` had no
denominator. Desktop's earliest step event was "clicked next on the password screen", already deep in
the flow, and mobile had no step events at all.

`Onboarding Started` now fires the moment the user enters a flow, carrying `method`
(`create` | `import` | `watch_only`) - desktop from the welcome screen's two buttons, mobile from the
landing screen and the watch-only entry. The funnel is then
`Onboarding Started → Wallet Created` (or `Wallet Imported`) `→ Wallet Funded → Transaction Sent`,
comparable across both apps.

The nine legacy desktop `Creating wallet: …` step events are untouched and keep working; they give
desktop finer intra-flow detail that mobile does not have. They are not worth replicating on mobile,
whose creation flow is genuinely shorter (the mnemonic backup is deferred to a separate flow rather
than being part of creation).
