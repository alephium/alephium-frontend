/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { create, windowedFiniteBatchScheduler } from '@yornaath/batshit'

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

class Batchers {
  tokenTypeBatcher = createTokenTypeBatcher()
  ftMetadataBatcher = createFTMetadataBatcher()
  nftMetadataBatcher = createNFTMetadataBatcher()

  init() {
    this.tokenTypeBatcher = createTokenTypeBatcher()
    this.ftMetadataBatcher = createFTMetadataBatcher()
    this.nftMetadataBatcher = createNFTMetadataBatcher()
  }
}

export const batchers = new Batchers()
