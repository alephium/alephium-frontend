# alephium-desktop-wallet

## 2.5.0

### Minor Changes

- c2a845a: Create addresses and sign transactions with Ledger

### Patch Changes

- 5a7bef0: Fix balances refresh after sending transactions
- 5a7bef0: Add data refresh button
- c21ea43: Improve performance
- 39205ff: Fix default address selection in transaction modals
- 0dfbaf5: Optimize transactions loading for wallets with only 1 address

## 2.4.4

### Patch Changes

- 535683b: Enable search in asset selection modal
- 8d30364: Fix displayed ALPH amounts
- 162e209: Fix closing of send modal after 2 seconds
- e322396: Disable send button when wallet is empty
- 3b9ff24: Display token prices
- 10ddaab: Improve accessibility for "Add asset" button
- 77cbdd6: Fix asset selection in send flow when default address is empty
- 8386e47: Fix display of ALPH on devnet
- bbe047d: Display data loading indicator next to wallet worth
- f86c95f: Add ability to get faucet tokens on devnet
- 5bfd88c: Add Chinese translations

## 2.4.3

### Patch Changes

- 57eeb92: Format displayed numbers and amounts based on user's current or selected region
- dbfb5b1: Fix default lock time
- e297fd8: Better support for video NFT display
- 3894654: Fix pending transaction amount display

## 2.4.2

### Patch Changes

- 8817e92: Fix white screen when auto-lock set to "off"
- 8817e92: Fix display of NFTs with missing images

## 2.4.1

### Patch Changes

- fc0a73f: Fix display of NFT collection details
- 5e2db37: Fix auto-lock idle detection mechanism
- 3139b9b: Fix logos display
- 4c1eb9e: Fix wallet import and passphrase unlock data initialization
- c67f965: Fix window minimize on dApp interactions (Windows)
- 180e547: Fix wallet initials animation
- bf3991f: Fix transactions caching

## 2.4.0

### Minor Changes

- 61ab7c9: Improve data loading experience with offline storage

### Patch Changes

- f12de08: Replace data fetching library from Redux to Tanstack (React Query)
- 47f4f2c: Warn user when wallet has too many addresses
- 93225ad: Fix app crash on invalid received WalletConnect data
- a8d5454: Display total transaction worth when sending
- f12de08: Improve display of pending transactions
- 312beb0: Allow user to delete addresses in bulk
- 407cbf5: Display address derivation path in developer tools
- 7161163: Improve NFT sending flow
- f0acbad: Allow user to delete address from their address list

## 2.3.7

### Patch Changes

- 2e044c9: Fix missing default address

## 2.3.5

### Patch Changes

- d12f884: Auto update on app launch

## 2.3.4

### Patch Changes

- 5375899: Fix duplicate copy address button in Receive modal
- 070d985: Gracefuly fail to connect to a non-Alephium dApp
- ad815fd: Add Greek language
- 584187a: Add group in address table
- 7147652: Improve address label consistency in send flow

## 2.3.3

### Patch Changes

- c4b1f82: Fix WalletConnect transfer request
- e34fd80: Update network endpoints

## 2.3.1

### Patch Changes

- 4f20ec5: Add Australian Dollar fiat currency option
- e78012b: Fix wallet creation error created by auto lock
- 2881dee: Fix UI freeze after wallet export

## 2.3.0

### Minor Changes

- 3d662cd: Improve secrets management to match Metamask's implementation

## 2.2.5

### Patch Changes

- d8030ee: Fix word wrapping when signing WalletConnect message
- b5b297d: Cleaner, more compact transaction lists
- ef5acbc: Redesign transaction details modal
- 12e1995: Support display of .mp4 NFTs
- 8d64f8b: Update tokens labels shown when no metadata exists in token list
- fbeb9ca: Migrate network settings to node-v210 & backend-v117
- 548615e: Sort tokens based on fiat worth
- ef5acbc: Simplify NFT cards
- ef5acbc: New NFT details modal

## 2.2.4

### Patch Changes

- a588dfb: Hide token tag for tokens not in token list
- a588dfb: Handle failure of token list API call
- 5985729: Fix display of NFTs in transaction list
- 548615e: Sort tokens based on fiat worth

## 2.2.3

### Patch Changes

- 5b3d701: Handle WalletConnect requests when app locks
- c20ddc0: Fix connecting to devnet through WalletConnect
- 01a0ee8: Add CAD fiat currency
- ed2c8ba: Add announcement banner
- 782daee: Fix display of failed transactions
- 9a03ebe: Reduce number of fetch retries to 3
- 2f808c6: Show devnet network option in dropdown when dev tools are enabled
- d2636e9: Fetch token prices & ALPH history using new Explorer BE endpoints

## 2.2.2

### Patch Changes

- e931d9f: Fix address hash overlap introduced in 2.2.1

## 2.2.1

### Patch Changes

- f98987d: Add clear WalletConnect cache button in general settings
- f7fb5fe: Fixing decimals in asset badges
- edc5fcf: Fix list of suggested words in wallet import
- 60938b2: Fix crash after login
- a309825: Sign messages through WalletConnect
- ac9906c: Keep up to 10 unresponsive WalletConnect requests and clear the rest to avoid crashes due to storage overload

## 2.2.0

### Minor Changes

- c4238c9: Fix Windows freeze due to WalletConnect storage management

### Patch Changes

- 78aa973: Show all addresses in destination address list

## 2.1.6

### Patch Changes

- 9a04fe7: Require at least 10 new tx when loading new tx page
- 09234bb: Fix UTXO consolidation error handling
- a1ad09a: Fix display of currency in address page
- 3d49ac4: Move apps shared code to shared package
- 81b2b62: Fix transaction loading
- 9875103: Allow auto-updater to use rc versions when current version is rc
- 718429a: Delay hiding of errors so that user has enough time to read/copy
- 718429a: Simplify error messages and fix size of popup when the error is too long
- 78a120b: Autofocus password field
- 9b1e2b0: Use new explorer backend token metadata endpoints to reduce number of network request and to not call the node anymore
- 718429a: Do not close send modal when receiving an error to allow user to update their inputs
- 09234bb: Manage multiple WalletConnect connections
- 6f97a34: Improved address select in the send flow, added more details to addresses (hash, group etc.) + misc quality of life improvements.
