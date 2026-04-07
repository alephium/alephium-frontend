# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monorepo for Alephium frontend applications and shared packages, managed with **pnpm** (v9.4.0) and **Turbo** (v1.13.4). Requires Node >= 20.

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
# Vitest-based packages (explorer, desktop-wallet, shared, shared-react, keyring)
pnpm --filter @alephium/shared exec vitest run path/to/file.test.ts

# Jest-based packages (mobile-wallet, shared-crypto, encryptor)
pnpm --filter @alephium/mobile-wallet exec jest path/to/file.test.ts
```

## Architecture

### Apps

- **`apps/explorer`** — Blockchain explorer web app (Vite + React + React Router)
- **`apps/desktop-wallet`** — Desktop wallet (Electron + Vite + React). Electron main process in `electron/main.ts`, preload in `electron/preload.ts`
- **`apps/mobile-wallet`** — Mobile wallet (React Native + Expo 54). Uses Jest (not Vitest) for tests

### Shared Packages

- **`packages/shared`** — Core utilities, Redux store slices, types, constants, API clients. Built with tsup (ESM). Most packages depend on this
- **`packages/shared-react`** — React hooks and components shared between apps. Built with tsup
- **`packages/shared-crypto`** — Cryptographic utilities (BIP39, key derivation). Built with webpack into a single bundle (`dist/alephium.min.js`)
- **`packages/keyring`** — Wallet key management. Built with tsup
- **`packages/encryptor`** — Encryption utilities. Built with tsup
- **`packages/wallet-dapp-provider`** — WalletConnect dApp provider. Built with Rollup

### Config Packages

- **`packages/eslint-config`** — Shared ESLint config (`base.js` for libraries, `react.js` for React apps)
- **`packages/typescript-config`** — Shared base TypeScript config

### Build Order

Turbo handles dependency ordering. Shared packages must build before apps (`^build` dependency). The `typecheck` task also depends on `^build` because it needs generated type declarations.

## Key Technical Decisions

- **State management**: Redux Toolkit for global state, React Query (TanStack) for server data with localStorage persistence
- **Styling**: Styled Components throughout all apps
- **Internationalization**: i18next with Crowdin sync for translations
- **Wallet connectivity**: WalletConnect v2 protocol via `@walletconnect/sign-client`
- **Crypto**: Custom `shared-crypto` package wrapping elliptic curve operations, Blake2b hashing, BIP39 mnemonics

## Code Style

- No semicolons, single quotes, no trailing commas, 120 char print width, 2-space indent (see `.prettierrc.js`)
- ESLint enforces: no unused imports (auto-removed), sorted imports (`simple-import-sort`), React Compiler warnings
- Lint runs with `--max-warnings=0` — all warnings are errors in CI
