import { useQuery } from '@tanstack/react-query'

import { powfiBackend } from '~/api/powfi'
import { SWAP_QUOTE_DEBOUNCE_MS, SWAP_QUOTE_REFETCH_INTERVAL_MS } from '~/features/swap/swapConstants'
import { SwapDirection, SwapQuote, SwapQuoteError } from '~/features/swap/swapTypes'
import useDebouncedValue from '~/hooks/useDebouncedValue'

interface UseSwapQuoteProps {
  inputMint?: string
  outputMint?: string
  amount?: bigint
  direction: SwapDirection
  slippageBps: number
  paused?: boolean
}

const useSwapQuote = ({ inputMint, outputMint, amount, direction, slippageBps, paused }: UseSwapQuoteProps) => {
  const debouncedAmount = useDebouncedValue(amount, SWAP_QUOTE_DEBOUNCE_MS)
  const enabled = !!inputMint && !!outputMint && debouncedAmount !== undefined && debouncedAmount > 0n

  const { data, error, isFetching, refetch } = useQuery<SwapQuote, SwapQuoteError>({
    queryKey: ['powfi-swap-quote', inputMint, outputMint, debouncedAmount?.toString(), direction, slippageBps],
    queryFn: async () => {
      const { data, error } = await powfiBackend.compute.swap.get({
        query: {
          inputMint: inputMint as string,
          outputMint: outputMint as string,
          amount: (debouncedAmount as bigint).toString(),
          action: direction,
          slippageBps: slippageBps.toString()
        }
      })

      if (error) throw error.value
      if (!data) throw new Error('Empty swap quote response')

      return data
    },
    enabled,
    refetchInterval: paused ? false : SWAP_QUOTE_REFETCH_INTERVAL_MS,
    retry: false,
    gcTime: 0
  })

  return {
    quote: enabled ? data : undefined,
    error: enabled ? error : null,
    isComputing: enabled && isFetching,
    refetch
  }
}

export default useSwapQuote
