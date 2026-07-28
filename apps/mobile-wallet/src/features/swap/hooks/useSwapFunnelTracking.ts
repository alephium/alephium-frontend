import { AnalyticsEvent } from '@alephium/shared'
import { useEffect, useRef } from 'react'

import { sendAnalytics } from '~/analytics'
import { SwapConfirmationStatus } from '~/features/swap/hooks/useSwapConfirmation'
import { swapQuoteAnalyticsProps } from '~/features/swap/swapAnalytics'
import { SwapQuote, SwapQuoteError } from '~/features/swap/swapTypes'

interface UseSwapFunnelTrackingProps {
  quote?: SwapQuote
  quoteError?: SwapQuoteError | null
  isSubmitted: boolean
  confirmation: SwapConfirmationStatus
  usedNonDefaultAddress: boolean
}

// The reactive half of the swap funnel: events driven by state the user does not click (a quote
// arriving, a quote failing, the tx settling on-chain). The click-driven events (initiated, executed,
// failed) fire inline at their handlers in SwapScreen.
const useSwapFunnelTracking = ({
  quote,
  quoteError,
  isSubmitted,
  confirmation,
  usedNonDefaultAddress
}: UseSwapFunnelTrackingProps) => {
  const amountTrackedRef = useRef(false)
  const outcomeTrackedRef = useRef(false)

  useEffect(() => {
    if (quote && !amountTrackedRef.current) {
      amountTrackedRef.current = true
      sendAnalytics({ event: AnalyticsEvent.SWAP_AMOUNT_SET, props: swapQuoteAnalyticsProps(quote) })
    }
  }, [quote])

  useEffect(() => {
    if (quoteError?.code)
      sendAnalytics({ event: AnalyticsEvent.SWAP_QUOTE_FAILED, props: { error_code: quoteError.code } })
  }, [quoteError?.code])

  useEffect(() => {
    if (!isSubmitted) {
      outcomeTrackedRef.current = false
      return
    }

    if (outcomeTrackedRef.current || !quote || confirmation === 'pending') return

    outcomeTrackedRef.current = true
    sendAnalytics({
      event: confirmation === 'confirmed' ? AnalyticsEvent.SWAP_CONFIRMED : AnalyticsEvent.SWAP_REVERTED,
      props: { ...swapQuoteAnalyticsProps(quote), used_non_default_address: usedNonDefaultAddress }
    })
  }, [confirmation, isSubmitted, quote, usedNonDefaultAddress])
}

export default useSwapFunnelTracking
