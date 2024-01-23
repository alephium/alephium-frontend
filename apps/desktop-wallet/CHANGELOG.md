# alephium-desktop-wallet

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
