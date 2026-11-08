# Refreshing balances at time-lock expiry

Desktop and mobile share one lock-expiry owner per address inside `ApiContextProvider`. An address with a nonzero locked ALPH or token balance reads its UTXO lock times from the node. The query requires a complete UTXO result (`error-if-exceed-max-utxos=true`); a truncated result must not silently omit an earlier expiry.

The nearest future lock time arms one timeout. At expiry the existing cancel-then-invalidate cascade refreshes that address's balance and derived data for the same network, without requiring a new transaction hash or changing the user's transaction list. Subsequent expiries are scheduled from the refreshed UTXOs. Delays longer than JavaScript's signed 32-bit timer limit are split into safe chunks, without invalidating early.

Lock time is compared against the local clock, but the node and explorer may not have indexed a block reaching that timestamp yet. After an expiry, refreshes retry every 10 seconds while the locked-balance signature is unchanged. A discovery error (including too many UTXOs) or a still-locked balance with no future lock also uses this bounded cadence. Addresses without locked assets make no UTXO requests and do not poll balances. The server remains authoritative: the wallet never locally subtracts locked balances or treats its own clock as proof that an output is spendable.

Network/address changes, going offline and unmounting clean up timers. Query keys and invalidation include network ID, and the UTXO request consumes the abort signal. Existing network initialization and online-state handling remain responsible for choosing the current endpoint. No wallet keys, signing, spending, or transaction broadcast are involved.

Regression tests in `packages/shared-react/test/balanceLockExpiry.test.ts` cover unchanged transaction state, derived balances, token-only locks, indexer lag, long locks, errors, network isolation, lifecycle cleanup and request cancellation.
