import { node } from '@alephium/web3'

interface CalculateMaxSendableAlphInput {
  availableBalance: bigint
  utxos: node.UTXO[]
  feeEstimate: bigint
  // Injectable for tests; defaults to the current wall clock in Unix ms.
  now?: number
}

// Returns the largest ALPH amount the address can safely send in a single transfer,
// after reserving the ALPH sitting inside token-holding UTXOs (which cannot be spent
// without also moving the tokens) and a conservative fee estimate.
export const calculateMaxSendableAlph = ({
  availableBalance,
  utxos,
  feeEstimate,
  now = Date.now()
}: CalculateMaxSendableAlphInput): bigint => {
  const alphTrappedInTokenUtxos = utxos.reduce((acc, utxo) => {
    const isUnlocked = utxo.lockTime === undefined || utxo.lockTime <= now
    const holdsTokens = (utxo.tokens?.length ?? 0) > 0
    return isUnlocked && holdsTokens ? acc + BigInt(utxo.amount) : acc
  }, 0n)

  const max = availableBalance - alphTrappedInTokenUtxos - feeEstimate
  return max > 0n ? max : 0n
}
