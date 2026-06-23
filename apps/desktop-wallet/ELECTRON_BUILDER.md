# electron-builder version (why 25.x, not 26)

The desktop wallet is intentionally pinned to **electron-builder `^25.1.8`**. Do not upgrade to
26 without first doing the work in [Upgrading to 26](#upgrading-to-26). A naive bump reintroduces
a build-breaking, cross-platform `EMFILE` failure.

> **Tracking issue:** [electron-userland/electron-builder#8842 (builds broken since
> v26.0.4)](https://github.com/electron-userland/electron-builder/issues/8842)

## TL;DR

- electron-builder **26.0.4** added a "node-module-collector" that shells out to
  `pnpm list --prod --json --depth Infinity` to compute what to bundle.
- On our hoisted pnpm monorepo that command explodes (~5 MB tree, opens 16k to 24k file
  descriptors at once) and `pnpm` dies with `EMFILE`, aborting the build.
- It fails on **macOS and Windows** alike. Windows has no `ulimit`, so raising OS limits cannot
  fix it. This is not an OS-tuning problem.
- We reverted to 25.x, which has no collector. Verified: 25.x builds in place in the hoisted
  workspace even at `ulimit -n 256`.

## What actually triggered it (a two-step collision)

The collector alone was not enough to break the build. It took two separate upgrades:

1. **2026-06-17** (commit `6c78a3d6`, "Upgrade electron builder"): electron-builder
   `25.1.8 -> 26.15.3`. This introduced the collector, but CI stayed green because we were still
   on **pnpm 9**, whose `pnpm list` did not exhaust descriptors on the same tree.
2. **2026-06-22** (commit `b2bda354`, "Upgrade pnpm 9.4.0 -> 11.8.0"): the hoisted layout did not
   change (`node-linker = hoisted` predates this), but **pnpm 11's `pnpm list --depth Infinity`
   opens far more files**, which tips it into `EMFILE`.

So the cause is the collector (e-b 26) meeting a `pnpm list` behavior change (pnpm 11). Rolling
back either side fixes it; we rolled back electron-builder because it is build tooling, whereas
pnpm 11 was a deliberate, repo-wide upgrade. The newest 26.x (26.15.5 as of June 2026) **still
hardcodes `--depth Infinity`**, so no 26.x patch release fixes this.

## What 25.x means for the build config

26.x changed the `build` config schema, so the current 25.x config differs from what 26 expects:

- `build.win.sign` / `build.win.signingHashAlgorithms` / `build.win.publisherName` are **flat**,
  not nested under `signtoolOptions` (that nesting is 26.x).
- `build.mac.notarize` is the object form `{ "teamId": "..." }`, not the `true` shorthand (26.x).
- `build.linux.desktop.exec` is present.
- `electron-builder-squirrel-windows` is **not** a direct dependency. 25.x bundles squirrel via
  `app-builder-lib`; 26.x modularized it into a separate package.

The CI signing-skip steps in `ci.yml` and `release-desktop.yml`, plus
[WINDOWS_SIGNING.md](./WINDOWS_SIGNING.md), reference the flat `build.win.sign` path accordingly.

## Upgrading to 26

A bump to 26 needs a collector mitigation **and** the config migration. Do not do one without the
other.

### 1. Pick a collector mitigation (required)

- **Option A: a `pnpm deploy` wrapper.** Package from an isolated, prod-only tree so the collector
  walks ~40 packages instead of ~4000. Verified: `pnpm deploy --prod --legacy <dir>` produces a
  tree where `pnpm list --depth Infinity` is clean at `ulimit 256`. You run electron-builder in
  that deploy dir (copy the vite `build/` and `dist-electron/` in first; macOS also needs a modest
  `ulimit` bump for electron-builder's own framework-copy step). This was fully implemented and
  validated, then removed when we chose the downgrade. See git history for
  `apps/desktop-wallet/scripts/package-electron.mjs`. Cost: more build complexity.
- **Option B: switch the monorepo to `nodeLinker: isolated`.** Going off hoisted likely
  de-explodes the collector (isolated scopes desktop's `pnpm list` to its own subtree) **and**
  lets us drop the phantom-dependency guards. But the mobile wallet currently relies on hoisted
  for Metro (see the comment in `pnpm-workspace.yaml`). Expo SDK 54+ supports isolated, but it is
  **conditional**: Expo's own docs warn that some React Native libraries break under isolated, and
  this app is native-module-heavy. Requires a real mobile validation pass (Metro bundle plus
  iOS/Android native builds), ideally on Expo SDK 56 (best isolated support to date, via its
  On-demand Filesystem). This is a monorepo-wide modernization, not a desktop-only change.
- **Option C: wait for an upstream fix.** Track #8842. If electron-builder makes the collector
  fd-safe (finite depth, batched reads, or graceful-fs), a 26.x bump becomes safe with no
  workaround.

### 2. Migrate the config (required)

- Nest `win.{sign,signingHashAlgorithms,publisherName}` under `win.signtoolOptions`.
- Change `mac.notarize` to `true` (teamId then comes from the `APPLE_TEAM_ID` env var set in
  `release-desktop.yml`).
- Add `electron-builder-squirrel-windows` as a direct devDependency only if you target squirrel.
  We do not; the default Windows target is nsis.
- Update the `unset:` paths in `ci.yml` and `release-desktop.yml`
  (`build.win.sign` -> `build.win.signtoolOptions.sign`) and
  [WINDOWS_SIGNING.md](./WINDOWS_SIGNING.md).

### 3. Verify

Build locally without signing, at the low descriptor limit that exposed the bug:

```shell
cd apps/desktop-wallet
pnpm build                                   # vite output (build/, dist-electron/)
CSC_IDENTITY_AUTO_DISCOVERY=false bash -c 'ulimit -n 256; pnpm exec electron-builder --dir'
```

A `dist/mac-arm64/Alephium.app` with no `EMFILE` means the collector is satisfied. Then let CI's
`build-desktop-wallet` matrix confirm all three operating systems.
