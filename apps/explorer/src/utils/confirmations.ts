import { explorer } from '@alephium/web3'

export const computeConfirmations = (txBlock?: explorer.BlockEntryLite, txChain?: explorer.PerChainHeight): number => {
  if (!txBlock || !Number.isFinite(txBlock.height)) return 0

  const chainHeight = txChain && Number.isFinite(txChain.value) ? txChain.value : txBlock.height

  // A tx in a block has >= 1 confirmation by definition; a lower chain height only means our data is lagging.
  return Math.max(chainHeight - txBlock.height + 1, 1)
}
