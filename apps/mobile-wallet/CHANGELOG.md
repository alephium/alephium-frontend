# @alephium/mobile-wallet

## 1.1.9

### Patch Changes

- abb7ffe: Integrate Sentry for improved crash reporting

## 1.1.8

### Patch Changes

- Updated dependencies [3eca397]
  - @alephium/shared@0.7.11
  - @alephium/keyring@0.0.1
  - @alephium/shared-react@0.0.3

## 1.1.7

### Patch Changes

- 2844f25: Show biometrics auth error to user
- ec6b2c0: Fix WalletConnect button inactivity

## 1.1.6

### Patch Changes

- 562fdeb: Regenerate wallet metadata if missing
- 0018f87: Fix data initialization when importing addresses
- d898018: Improve address import UX
- fa9f9bc: Enable Portuguese language
- ef7920a: Fix display of security settings

## 1.1.5

### Patch Changes

- 52a5834: Fix wallet delete
- 5e8c14b: Do not display authentication modal on app fresh install

## 1.1.4

### Patch Changes

- 18ddd26: Fix authentication issues

## 1.1.3

### Patch Changes

- a03242a: Fix keyboard overlap in assets list
- d7e9844: Allow user to enable device passcode/screen lock code/pattern to unlock app/transact
- d8955f8: Fix being stuck in empty black screen

## 1.1.2

### Patch Changes

- 648d314: Improve dApp connection on cold start by preloading data
- 6030a02: Add Vietnamese
- 477488b: Show loader while waiting for NFT image to load
- d7581c8: Fix display of boolean NFT attributes
- fc61cb8: Fix display of SVG NFTs

## 1.1.1

### Patch Changes

- 3770483: Add French
- 1fcc7f9: Enable multilingual support
- 637d2be: Add Greek language
- 3770483: Fix multiple authentication issues
- 1a5a657: Fix fund password fields submitting when pressing return key
- fe0f400: Fix aspect ration of NFTs

## 1.1.0

### Minor Changes

- 16c85da: Deprecate pin in favor of biometrics
- 16c85da: Adopt Uniswap mobile secrets management
- 16c85da: Adopt Uniswap mobile authentication flow

### Patch Changes

- 3c95e87: Take into account transaction authentication settings when approving WalletConnect requests
- 40ea162: Fix laggy performance of sending flow
- 9a7181b: Add auto-lock settings
- 4f20ec5: Add Australian Dollar fiat currency option
- 14b306e: Introduce funding password feature
- 3c95e87: Properly place WalletConnect request approval modal behind app access authentication screen
- e34fd80: Update network endpoints

## 1.0.10

### Patch Changes

- c980000: Add privacy manifest file for iOS
- c980000: Update dependencies

## 1.0.9

### Patch Changes

- fbeb9ca: Migrate network settings to node-v210 & backend-v117
- Updated dependencies [5189168]
  - @alephium/shared@0.7.10
  - @alephium/shared-crypto@0.7.10
  - @alephium/shared-react@0.0.2

## 1.0.8

### Patch Changes

- 128b45f: Faster data loading
- 01a4c12: Simplify address picker
- f6df862: Delete cached data after deleting a wallet
- 128b45f: Do not re-initialize data if the app goes to the background while it is still syncing data
- efaa540: Improve image loading performance
- 898c4ca: Remove chart for better app performance
- 17b7ef0: Add screen allowing public keys copy

## 1.0.7

### Patch Changes

- 548615e: Sort tokens based on fiat worth
- 7a92003: Always display WalletConnect icon if enabled in settings
- 8f8040c: Clear WalletConnect cache when disabling WalletConnect
- 7a92003: Display error when WalletConnect connection failed
- 9a03ebe: Reduce number of fetch retries to 3
- 982edcf: Upgrade to Expo 50
- 26abdbc: Disable app backup on Android
- 6b66a61: Fix currency selection
- 4ab6ed8: Refactored the LandingScreen
- f5cdfbb: Sign unsigned transactions

## 1.0.6

### Patch Changes

- 782daee: Fix display of failed transactions
- 9eb2ca9: Fix connecting to devnet through WalletConnect
- 28f2703: Add button to open camera from WalletConnect pairings modal
- d409af2: Fix display of received transactions that were displayed as moved
- 66edd8a: Display token prices
- 5dbc07a: Enlarge NFT image on thumbnail tap
- 29ea755: Display NFT attributes
- 01a0ee8: Add CAD fiat currency

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
