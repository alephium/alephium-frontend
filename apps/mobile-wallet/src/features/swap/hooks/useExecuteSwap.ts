import { signAndSubmitTxResultToSentTx, transactionSent } from '@alephium/shared/store'
import { ALPH } from '@alephium/token-list'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { useCallback } from 'react'

import { powfiSwapSdk } from '~/api/powfi'
import { selectSwapFromAddressHash } from '~/features/swap/swapSelectors'
import { SwapQuote } from '~/features/swap/swapTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

// powfiSwapSdk's signer resolves the same from-address, so cpmm.swap's `sender` and the tx signer match.
const useExecuteSwap = () => {
  const dispatch = useAppDispatch()
  const fromAddressHash = useAppSelector(selectSwapFromAddressHash)
  const slippage = useAppSelector((s) => s.swap.slippage)

  const executeSwap = useCallback(
    async (quote: SwapQuote, balances: Map<string, bigint>): Promise<SignExecuteScriptTxResult> => {
      if (!fromAddressHash) throw new Error('No address selected for the swap')

      // The on-chain min-out protection is derived from quote.slippageBps, so refuse to sign if the
      // backend widened it past what the user set - otherwise the trade could execute worse than shown.
      const expectedSlippageBps = Math.round(slippage * 10000)
      if (Number(quote.slippageBps) !== expectedSlippageBps) {
        throw new Error(`Swap slippage mismatch: expected ${expectedSlippageBps} bps, got ${quote.slippageBps}`)
      }

      const inputAmount = BigInt(quote.inputAmount)
      const outputAmount = BigInt(quote.outputAmount)

      if (inputAmount === 0n && outputAmount === 0n) {
        throw new Error('Either the input or the output amount must be specified')
      }

      let result: SignExecuteScriptTxResult

      if (quote.poolType === 'concentrated') {
        // CLMM: the amount is signed (positive for exact-in, negative for exact-out) and the slippage
        // absorbs the expected price impact, matching the frontend.
        const amountSpecified = quote.swapType === 'sell' ? inputAmount : -outputAmount
        const priceImpactBps = Math.floor((quote.priceImpactPct || 0) * 100)
        const totalSlippageBps = BigInt(quote.slippageBps) + BigInt(priceImpactBps)

        result = await powfiSwapSdk.clmm.swap({
          token0: quote.inputMint,
          token1: quote.outputMint,
          amount: amountSpecified,
          amountIn: inputAmount,
          routePlan: quote.routePlan.map((configIndex) => BigInt(configIndex)),
          slippage: totalSlippageBps
        })
      } else {
        // Deferred platform fee: cpmm.swap exposes no fee/recipient parameter, so none is collected
        // today. When it does, pass NATIVE_SWAP_FEE_BPS / NATIVE_SWAP_FEE_RECIPIENT here - the fee seam.
        result = await powfiSwapSdk.cpmm.swap(
          {
            tokenInId: quote.inputMint,
            tokenOutId: quote.outputMint,
            slippageBps: BigInt(quote.slippageBps),
            sender: fromAddressHash,
            amountIn: quote.swapType === 'sell' ? inputAmount : undefined,
            amountOut: quote.swapType === 'buy' ? outputAmount : undefined
          },
          balances
        )
      }

      const isSwappingFromAlph = quote.inputMint === ALPH.id
      const sentTx = signAndSubmitTxResultToSentTx({
        type: 'EXECUTE_SCRIPT',
        txParams: {
          signerAddress: fromAddressHash,
          attoAlphAmount: isSwappingFromAlph ? inputAmount.toString() : undefined,
          tokens: isSwappingFromAlph ? undefined : [{ id: quote.inputMint, amount: inputAmount.toString() }],
          bytecode: ''
        },
        result
      })
      dispatch(transactionSent(sentTx))

      return result
    },
    [fromAddressHash, slippage, dispatch]
  )

  return { executeSwap }
}

export default useExecuteSwap
