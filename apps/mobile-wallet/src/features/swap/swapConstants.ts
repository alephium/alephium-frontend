// Slippage is stored as a fraction (0.005 = 0.5%), matching the Powfi frontend.
export const DEFAULT_SWAP_SLIPPAGE = 0.005

// Quick-select slippage options, matching the Powfi frontend's [0.1%, 0.5%, 1%].
export const SWAP_SLIPPAGE_OPTIONS = [0.001, 0.005, 0.01]

// Maximum custom slippage a user can enter (50%).
export const MAX_SWAP_SLIPPAGE = 0.5

// Above 0.5% the trade may be frontrun; below 0.1% it may fail. Matches the frontend's warnings.
export const SWAP_SLIPPAGE_FRONTRUN_WARNING = 0.005
export const SWAP_SLIPPAGE_FAIL_WARNING = 0.001

// Price impact (in percent) above which the swap requires an explicit high-risk confirmation.
export const SWAP_HIGH_PRICE_IMPACT_PERCENT = 5

// Debounce before refetching a quote after the amount changes, and the idle refetch interval.
export const SWAP_QUOTE_DEBOUNCE_MS = 200
export const SWAP_QUOTE_REFETCH_INTERVAL_MS = 30_000

// --- Deferred platform fee ------------------------------------------------------------------
// The Powfi SDK's cpmm.swap / clmm.swap build, sign and submit a fixed swap script atomically
// and expose NO fee/recipient parameter (verified at the bytecode level). So no extra fee is
// collected today. When the SDK adds a fee parameter, set these two values and wire them at the
// single seam marked in useExecuteSwap.ts — no other change is needed.
// Intended fee: 0.5% (50 bps).
export const NATIVE_SWAP_FEE_BPS = 0 // TODO: set to 50 once the SDK supports a swap fee parameter
export const NATIVE_SWAP_FEE_RECIPIENT: string | undefined = undefined // TODO: set the fee-collection address
