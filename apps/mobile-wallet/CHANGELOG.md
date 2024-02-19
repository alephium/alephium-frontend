# @alephium/mobile-wallet

## 1.0.6

### Patch Changes

- 782daee: Fix display of failed transactions
- 9eb2ca9: Fix connecting to devnet through WalletConnect
- 28f2703: Add button to open camera from WalletConnect pairings modal
- d409af2: Fix display of received transactions that were displayed as moved
- 66edd8a: Display token prices

## 1.0.5

### Patch Changes

- ad9fd6d: Improve dApp experience by responding to WalletConnect requests while the app is in the background

## 1.0.4

### Patch Changes

- 6a7419c: Fix install on OnePlus by handling storage error
- da74c2d: Fix type issue
- a5b9592: Fallback to pin when detecting biometrics settings change
- 14d786b: Greatly simplified the main header component's structure and behaviour, hence simplifying the overall layout of the app.
- 6a7419c: Fix analytics capturing
- 432338d: Sign messages through WalletConnect
- a5b9592: Fix landing screen not showing buttons
- 4fb65e0: Keep up to 10 unresponsive WalletConnect requests and clear the rest to avoid crashes due to storage overload
- Updated dependencies [bb782ab]
  - @alephium/shared@0.7.8

## 1.0.3

### Patch Changes

- c4238c9: Fix iOS crash due to WalletConnect storage management
- 3951e2b: Pair with dApp after enabling WalletConnect feature
- 04d0dfb: Display version number in settings screen
- d71e08a: Fix iOS crash due to WalletConnect client initialization
- 46d7299: Fix WalletConnect client double initialization

## 1.0.1

### Patch Changes

- 3d49ac4: Move apps shared code to shared package
- e84374d: Improve display of UTXO consolidation modal
- 02d4845: Fix incomplete list of transactions
- 90c4e3f: Pair with dApp after enabling WalletConnect feature
- 54435a5: Display WalletConnect success approval/rejection message so that user knows they can switch back to the browser
- 4b9b0cc: Improve info, success, and error messages display
- ff9f5ec: Fix amount input when numerical keyboard has only comma available
- a1bb65e: Use new metadata endpoints for optimization
- 54435a5: Add WalletConnect redirect deep link so that dApps can redirect to the mobile wallet on session requests
- 8b6c602: New layout for toasts
- Updated dependencies [9b1e2b0]
- Updated dependencies [3d49ac4]
- Updated dependencies [a1bb65e]
  - @alephium/shared@0.7.7
