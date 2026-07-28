import { sendAnalytics } from '~/analytics'
import { DEFAULT_SWAP_SLIPPAGE, MAX_SWAP_SLIPPAGE } from '~/features/swap/swapConstants'
import { storage } from '~/persistent-storage/storage'
import { storeWithReportableError } from '~/persistent-storage/utils'

const SWAP_SLIPPAGE_KEY = 'alephium_swap_slippage'

export const getSwapSlippage = (): number => {
  try {
    const raw = storage.getString(SWAP_SLIPPAGE_KEY)
    const parsed = raw !== undefined ? Number(raw) : DEFAULT_SWAP_SLIPPAGE

    return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, MAX_SWAP_SLIPPAGE) : DEFAULT_SWAP_SLIPPAGE
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not parse swap slippage' })

    return DEFAULT_SWAP_SLIPPAGE
  }
}

export const storeSwapSlippage = (slippage: number) => storeWithReportableError(SWAP_SLIPPAGE_KEY, slippage.toString())
