import { explorer as e } from '@alephium/web3'
import { Batcher, create, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { throttledClient } from '@/api/throttledClient'

const tokenIdResolver = <T extends { id: string }>(results: T[], queryTokenId: string) =>
  results.find(({ id }) => id === queryTokenId)

const createTokenTypeBatcher = () =>
  create({
    fetcher: throttledClient.explorer.tokens.postTokens,
    resolver: (results, queryTokenId) => results.find(({ token }) => token === queryTokenId),
    scheduler: windowedFiniteBatchScheduler({ maxBatchSize: TOKENS_QUERY_LIMIT, windowMs: 10 })
  })

const createFTMetadataBatcher = () =>
  create({
    fetcher: throttledClient.explorer.tokens.postTokensFungibleMetadata,
    resolver: tokenIdResolver,
    scheduler: windowedFiniteBatchScheduler({ maxBatchSize: TOKENS_QUERY_LIMIT, windowMs: 10 })
  })

const createNFTMetadataBatcher = () =>
  create({
    fetcher: throttledClient.explorer.tokens.postTokensNftMetadata,
    resolver: tokenIdResolver,
    scheduler: windowedFiniteBatchScheduler({ maxBatchSize: TOKENS_QUERY_LIMIT, windowMs: 10 })
  })

// Explicitely annotating types
// See https://chatgpt.com/c/67487a60-81f4-8007-ae20-bc89db07d4a7
class Batchers {
  tokenTypeBatcher: Batcher<e.TokenInfo[], string, e.TokenInfo | undefined> = createTokenTypeBatcher()
  ftMetadataBatcher: Batcher<e.FungibleTokenMetadata[], string, e.FungibleTokenMetadata | undefined> =
    createFTMetadataBatcher()
  nftMetadataBatcher: Batcher<e.NFTMetadata[], string, e.NFTMetadata | undefined> = createNFTMetadataBatcher()

  init() {
    this.tokenTypeBatcher = createTokenTypeBatcher()
    this.ftMetadataBatcher = createFTMetadataBatcher()
    this.nftMetadataBatcher = createNFTMetadataBatcher()
  }
}

export const batchers = new Batchers()
