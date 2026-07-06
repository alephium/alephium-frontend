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
tables below) and point insights/funnels at the Action — no data is lost, and no rename is
needed on the PostHog side. Events already under one shared name (see "Left unchanged") did
**not** change and need no bridging.

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
| `WalletConnect Connected` | `Approved WalletConnect connection` | `WC: Approved connection`          |
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
| `Transaction Approved` | `transfer`      | — (see note)                                | `Approved transfer`            |
| `Transaction Approved` | `chained`       | `Approved chained tx`                       | `Approved chained tx`          |

**Note on `transfer`:** desktop never had a distinct dApp-transfer event — a WalletConnect
transfer is emitted as `Transaction Sent` with `origin: 'walletconnect'` (it used to be the
one-off `'wc'`; normalised here since the event is being renamed anyway, so no extra history
split). That behaviour is unchanged, so on desktop a dApp transfer still appears under
`Transaction Sent` (distinguishable by `origin`),
while on mobile it is `Transaction Approved` with `tx_type: 'transfer'`. Keep this asymmetry in
mind when comparing dApp-transfer volume across platforms.

## Left unchanged (already shared, or single-platform)

- **Already shared** (identical string in both apps, so already funnel-ready — renaming would
  split history for no gain): `Consolidated UTXOs`, `Deleted wallet`, `Region changed`,
  `Saved custom network settings`, `WC: Disconnected from dApp`, `Error`.
- **Single-platform** events (no cross-platform twin to unify) keep their existing names — e.g.
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
   `dapp_url` on all approval + message-signing events (dApp attribution), mobile
   `Wallet Unlocked` (biometric/app-resume path, previously untracked), and mobile
   `Disabled analytics` / `Enabled analytics` (mobile opt-out rate).

## PostHog entities status (2026-07-07)

**Created (use existing data):**

- Cohort **Outliers / likely-internal (auto)** (id 174867) — auto-updating: `Wallet switched` >= 100 OR
  `Copied address private key` >= 20 in the last 90 days. Exclude it from insights so one power-user does not
  skew aggregates (median switches/user = 2, but one account = ~91% of all switches). Prefer unique-user counts
  and median over sum/average for skewed metrics.
- Insight **Wallet switches per user (distribution) — 90d** (short_id `u3yAuv9O`) — the long-tail histogram.

**Still to do:**

- **Post-release (needs new-event data):** save the Send funnel
  (`Send Button Clicked → Send Destination Set → Send Amount Set → Send Review Reached → Transaction Sent | Transaction Failed`),
  the Activation funnel (`Wallet Created → Wallet Funded → Transaction Sent`), and the dApp funnel
  (`WalletConnect Connection Requested → WalletConnect Connected`; plus `Opened dApp → Transaction Approved`
  joined on `dapp_url`).
- **At release:** the rename-proofing Actions above.
- **Optional now:** a Stickiness insight on `Wallet unlocked` (engagement-frequency distribution).
