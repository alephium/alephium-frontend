# Analytics

How to add or change tracking in this monorepo, and why it is set up the way it is.

For the 2026-07 migration itself (event renames, property renames, the PostHog Actions that bridge
them, and the pre-release baseline), see [`analytics-events-migration.md`](./analytics-events-migration.md).

## The one thing to internalise

Analytics is **green but wrong** by default. A misspelled property, a value in the wrong case, a URL
where the sibling event sends a host: all of these compile, lint, pass tests, and send successfully.
Nothing fails. The dashboard is just quietly wrong, and nobody finds out for months.

So this codebase pushes as much as it can into types, and the rest has to be verified against real
data before it ships. Both halves matter; neither is sufficient alone.

## Everything is a closed type

All three live in [`packages/shared/src/`](../packages/shared/src/):

| What | Where | Why |
| --- | --- | --- |
| Event names | `analyticsEvents.ts` (`AnalyticsEvent`) | A typo cannot ship |
| Property keys | `analytics.ts` (`AnalyticsProps`) | **No index signature.** An unknown key fails to compile |
| `origin` values | `analytics.ts` (`AnalyticsOrigin`) | The same surface cannot be spelled two ways |

`AnalyticsProps` having no index signature is deliberate and load-bearing. It is what makes
`sendAnalytics({ props: { dAppUrl } })` a compile error instead of a second, silent PostHog property
that no breakdown will ever find. Do not add one back.

To send a new property, add it to `AnalyticsProps` first. That is the point.

## Adding an event

1. Add the name to `AnalyticsEvent`. Use `Object Action` casing (`Wallet Unlocked`), and the **same
   string on both apps** if the concept exists on both, so it can be funnelled cross-platform.
2. Add any new props to `AnalyticsProps`. New keys are `snake_case`.
3. Emit it: `sendAnalytics({ event: AnalyticsEvent.X, props: { ... } })`.
4. Verify it end to end (see below). Not optional.

### Naming rules that exist because we broke them

- **A value is the exact string sent to PostHog.** Changing one splits that event's history. Treat
  names as immutable once shipped.
- **Name the concept, not the transport.** `dApp Connected` carries `origin: walletconnect | in_app_browser`.
  It used to be called `WalletConnect Connected`, which would have meant either not tracking in-app
  browser connections at all, or recording them under a name that is simply untrue.
- **Prefer one event with a property over N events.** `Transaction Approved` + `tx_type` replaced eight
  per-type approval events that could not be summed or trended together.

## dApp identity: `dapp_host`, normalised centrally

A dApp's identity is its **host**, matching how the wallet already authorizes it. The same dApp used
to reach analytics in three formats depending on the code path (`https://app.linxlabs.org` from the
registry, `app.linxlabs.org` from the in-app browser, `https://alphpad.com/` with a trailing slash),
which meant the dApp funnel joined on nothing.

Every value now passes through `getDappHost()` inside each app's `sendAnalytics`, **not** at the ~20
emit sites. Pass whatever URL or host you have; it gets normalised. A new call site cannot
reintroduce the inconsistency, which is the whole point of doing it centrally.

## Errors

`sendAnalytics({ type: 'error', message, error, isSensitive, category })`.

- `redactSensitiveData` strips URLs, emails, hex blobs and addresses from **every** error reason.
- `isSensitive: true` additionally runs the BIP39 pass, which redacts **runs of 4+ consecutive**
  wordlist words. It deliberately does *not* redact isolated words: the wordlist is ordinary English
  (`phrase`, `already`, `secret`), and redacting one at a time turned
  `Keyring: Secret recovery phrase already provided` into `Keyring: Secret recovery [...] [...] provided`.
  Only a run can be a leaked mnemonic, and a real one is at least 12 words.

## Privacy

The properties that leak are the ones the SDK attaches **for you**, not the ones you send. They grow
with each SDK release while a hand-written scrubbing list stays frozen at the day it was written.

When you add or upgrade an SDK, dump the full property set of one real event and read every line.
Ask of each: does this describe the product, or the person?

Two things cannot be controlled from the code, and it is worth knowing which:

- **IP address.** Stamped server-side from the request. Setting `$ip` in a property is a no-op, and so
  was posthog-js's `ip: false`, which is deprecated and has no effect at all. The only control is the
  `anonymize_ips` project setting. `$geoip_disable` (which we do send) is what suppresses the
  city/postcode/lat-long enrichment.
- **Historical data.** PostHog events are immutable. Nothing can be scrubbed after the fact, so a
  property that should never have been sent stays until retention expires.

## Verifying a change (required)

Typecheck and tests prove **shape**, never **meaning**. A wrong event name, a camelCase key, or a value
in the wrong format all compile, lint, pass tests, and send successfully. Nothing fails; the dashboard
is just wrong. So the deliverable is not "it builds", it is "I watched the event land and read its
properties".

1. Point a dev build at a **throwaway** PostHog project. Both apps read this from a local `.env`
   (gitignored) and both default to production behaviour when unset:

   ```
   # apps/desktop-wallet/.env
   VITE_POSTHOG_KEY=<throwaway project key>
   VITE_POSTHOG_CAPTURE_IN_DEV=true

   # apps/mobile-wallet/.env
   EXPO_PUBLIC_POSTHOG_KEY=<throwaway project key>
   EXPO_PUBLIC_POSTHOG_CAPTURE_IN_DEV=true
   ```

   Mobile needs `pnpm --filter @alephium/mobile-wallet start --clear`: `EXPO_PUBLIC_*` vars are inlined
   by Metro at bundle time, so without `--clear` you will keep sending to **production**.

   Enable analytics in the app's settings, and restart desktop afterwards (it reads that setting once,
   at PostHog init).

2. Walk the flow as a user. Check the exact event name **and every property**, against what the code
   intended.

3. For funnels, check **monotonicity**: each step fires once, in order, and no step outnumbers the one
   before it. An inversion means a double-fire or a path that skips a step.

Anything you cannot exercise this way is **unverified**, and worth saying so out loud rather than
letting a green CI run imply otherwise.
