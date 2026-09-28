import { TokenId } from '@alephium/shared/types'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT } from '@alephium/web3'

import { SWAP_FEE_BPS } from '~/features/swap/swapConstants'

interface CalculateSwapFeeProps {
  grossAmount: bigint
  inputTokenId: TokenId
  bps?: number
}

export const calculateSwapFee = ({ grossAmount, inputTokenId, bps = SWAP_FEE_BPS }: CalculateSwapFeeProps): bigint => {
  if (bps <= 0 || grossAmount <= 0n) return 0n

  const fee = (grossAmount * BigInt(bps)) / 10000n

  if (inputTokenId === ALPH.id && fee < DUST_AMOUNT) return 0n

  return fee
}
