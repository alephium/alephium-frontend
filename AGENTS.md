# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for Alephium frontend applications and shared packages, managed with **pnpm** (v11.8.0) and **Turbo** (v2.9.18). Requires Node >= 22.13.

## Common Commands

### Root-level (runs across all packages via Turbo)

```bash
pnpm install              # Install deps (runs manypkg check:deps via postinstall)
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages
pnpm lint:fix             # Auto-fix lint issues
pnpm typecheck            # Type-check all packages
pnpm check                # typecheck + lint + format (full CI check)
pnpm watch                # Watch mode for all packages (turbo watch-dev)
pnpm clean                # Clean build artifacts
```

### Running a single package

Use `--filter` to target a specific package:

```bash
pnpm --filter @alephium/explorer test
pnpm --filter alephium-desktop-wallet test
pnpm --filter @alephium/shared test
pnpm --filter @alephium/shared lint
```

### App-specific dev servers

```bash
# Explorer (Vite, port 3000)
pnpm --filter @alephium/explorer start

# Desktop wallet (Electron + Vite)
pnpm --filter alephium-desktop-wallet start

# Mobile wallet (Expo dev client)
pnpm --filter @alephium/mobile-wallet start
```

### Running a single test file

```bash
# Every package uses Vitest
pnpm --filter @alephium/shared exec vitest run path/to/file.test.ts
pnpm --filter @alephium/mobile-wallet exec vitest run path/to/file.test.ts
```

Note that the mobile wallet only collects tests matching `__tests__/**/*.{test,spec}.{js,ts}`
(see `apps/mobile-wallet/vitest.config.ts`), whereas the other packages colocate their test
files next to the source.

## Architecture

### Apps

- **`apps/explorer`** — Blockchain explorer web app (Vite + React + React Router)
- **`apps/desktop-wallet`** — Desktop wallet (Electron + Vite + React). Electron main process in `electron/main.ts`, preload in `electron/preload.ts`
- **`apps/mobile-wallet`** — Mobile wallet (React Native + Expo 54)

### Shared Packages

- **`packages/shared`** — Core utilities, Redux store slices, types, constants, API clients. Ships raw TypeScript source (no build step). Most packages depend on this
- **`packages/shared-react`** — React hooks and components shared between apps. Ships raw TypeScript source (no build step)
- **`packages/keyring`** — Wallet key management. Ships raw TypeScript source (no build step)
- **`packages/encryptor`** — Encryption utilities (`@metamask/browser-passworder` wrapper). Ships raw TypeScript source (no build step)
- **`packages/wallet-dapp-provider`** — Provider injected into the in-app dApp browser WebView. Built with Rollup (emits a UMD-wrapped-in-JSON bundle for WebView injection)

### Config Packages

- **`packages/eslint-config`** — Shared ESLint config (`base.js` for libraries, `react.js` for React apps)
- **`packages/typescript-config`** — Shared base TypeScript config

### Build Strategy & Order

Shared packages follow one rule: **ship raw TypeScript source** and let each consuming app's bundler (Vite for explorer/desktop, Metro for mobile) compile them — no build step, no `dist`. The only exception is the package that must emit a non-source runtime artifact, which is the only one with a `build` script: `wallet-dapp-provider` (Rollup → a UMD-wrapped-in-JSON bundle injected into the in-app dApp browser WebView).

Turbo handles ordering: that built package must build before apps (`^build`). The `typecheck` task also depends on `^build` because it needs its generated `.d.ts`.

## Key Technical Decisions

- **State management**: Redux Toolkit for global state, React Query (TanStack) for server data with localStorage persistence
- **Styling**: Styled Components throughout all apps
- **Internationalization**: i18next with Crowdin sync for translations
- **Wallet connectivity**: WalletConnect v2 protocol via `@walletconnect/sign-client`
- **Crypto**: Wallet key management (BIP39 mnemonics, elliptic curve operations) via `@alephium/keyring` and `@alephium/web3`; password-based encryption (AES-256-GCM + PBKDF2) via `@alephium/encryptor`

## Changesets

Any change that affects a user must ship with a changeset, in the same PR. The changelogs are
generated from these, so a missing changeset means the change never shows up in the release notes.

```bash
npx changeset          # pick the package(s), pick "patch", write the description
npx changeset status   # verify it parses and bumps what you expect
```

That writes a file to `.changeset/`, which you commit alongside the code:

```markdown
---
'@alephium/mobile-wallet': patch
---

Fix contact deletion
```

Conventions:

- **Name the app whose behaviour changed**, not every package you touched. A change to
  `packages/shared` or `packages/shared-react` that only exists to serve the explorer belongs in the
  explorer's changelog; a reader of `@alephium/shared`'s changelog does not care.
- **Write it for a user, not a reviewer.** Describe the product change in one line, imperative mood,
  no trailing period. "Fix contact deletion", not "Refactor useAddressDataPolling to drive the
  invalidation cascade".
- Skip the changeset only when nothing user-facing changed (docs, CI, internal refactors with no
  behavioural difference, test-only changes).

## Code Style

- No semicolons, single quotes, no trailing commas, 120 char print width, 2-space indent (see `.prettierrc.js`)
- ESLint enforces: no unused imports (auto-removed), sorted imports (`simple-import-sort`), React Compiler warnings
- Lint runs with `--max-warnings=0` — all warnings are errors in CI
