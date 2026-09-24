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

// Platform fee
export const SWAP_FEE_BPS = 30
export const SWAP_FEE_RECIPIENT: string | undefined = process.env.EXPO_PUBLIC_SWAP_FEE_RECIPIENT
