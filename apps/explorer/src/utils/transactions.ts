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

import {
  calcTxAmountsDeltaForAddress,
  getDirection,
  isConsolidationTx,
  isMempoolTx,
  isSwap,
  TransactionDirection,
  TransactionInfo,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { MempoolTransaction, Token, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { groupBy, map, mapValues, reduce, sortBy, uniq } from 'lodash'

import { useAssetsMetadata } from '@/api/assets/assetsHooks'

export const useTransactionInfo = (tx: Transaction | MempoolTransaction, addressHash: string): TransactionInfo => {
  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: explorer.Output[] = []
  let lockTime: Date | undefined

  outputs = tx.outputs ?? outputs
  const { alph: alphDeltaAmount, tokens: tokensDeltaAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

  amount = alphDeltaAmount

  const assetsMetadata = useAssetsMetadata(map(tokensDeltaAmounts, 'id'))

  if (isConsolidationTx(tx)) {
    direction = 'out'
    infoType = 'move'
  } else if (isSwap(amount, tokensDeltaAmounts)) {
    direction = 'swap'
    infoType = 'swap'
  } else if (isMempoolTx(tx)) {
    direction = getDirection(tx, addressHash)
    infoType = 'pending'
  } else {
    direction = getDirection(tx, addressHash)
    infoType = direction
  }

  lockTime = outputs.reduce(
    (a, b) =>
      a > new Date((b as explorer.AssetOutput).lockTime ?? 0) ? a : new Date((b as explorer.AssetOutput).lockTime ?? 0),
    new Date(0)
  )
  lockTime = lockTime?.toISOString() === new Date(0).toISOString() ? undefined : lockTime

  const tokenAssets = [
    ...tokensDeltaAmounts.map((token) => ({
      ...token,
      ...assetsMetadata.fungibleTokens.find((i) => i.id === token.id),
      ...assetsMetadata.nfts.find((i) => i.id === token.id)
    }))
  ]

  const sortedTokens = sortBy(tokenAssets, [
    (v) => !v.type,
    (v) => !v.verified,
    (v) => v.type === 'non-fungible',
    (v) => v.type === 'fungible',
    (v) => (v.type === 'fungible' ? v.symbol : v.file?.name)
  ])

  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...sortedTokens] : sortedTokens

  return {
    assets,
    direction,
    infoType,
    outputs,
    lockTime
  }
}

// TODO: The following 2 functions could be ported to js-sdk (and properly tested there)
type AttoAlphAmount = string
type TokenAmount = string
type Address = string

type UTXO = {
  attoAlphAmount?: AttoAlphAmount
  address?: Address
  tokens?: Token[]
}

export const sumUpAlphAmounts = (utxos: UTXO[]): Record<Address, AttoAlphAmount> => {
  const validUtxos = utxos.filter((utxo) => utxo.address && utxo.attoAlphAmount)

  const grouped = groupBy(validUtxos, 'address')
  const summed = mapValues(grouped, (addressGroup) =>
    reduce(addressGroup, (sum, utxo) => (BigInt(sum) + BigInt(utxo.attoAlphAmount || 0)).toString(), '0')
  )

  return summed
}

export const sumUpTokenAmounts = (utxos: UTXO[]): Record<Address, Record<Token['id'], TokenAmount>> => {
  const validUtxos = utxos.filter((utxo) => utxo.address && utxo.tokens && utxo.tokens.length > 0)

  const grouped = groupBy(validUtxos, 'address')
  const summed = mapValues(grouped, (addressGroup) => {
    const tokenSums: Record<Token['id'], TokenAmount> = {}

    for (const utxo of addressGroup) {
      for (const token of utxo.tokens || []) {
        tokenSums[token.id] = (BigInt(tokenSums[token.id] || 0) + BigInt(token.amount)).toString()
      }
    }
    return tokenSums
  })

  return summed
}

export const IOAmountsDelta = (
  inputs: UTXO[] = [],
  outputs: UTXO[] = []
): { alph: Record<Address, AttoAlphAmount>; tokens: Record<Address, Record<Token['id'], TokenAmount>> } => {
  const summedInputsAlph = sumUpAlphAmounts(inputs)
  const summedOutputsAlph = sumUpAlphAmounts(outputs)
  const summedInputTokens = sumUpTokenAmounts(inputs)
  const summedOutputTokens = sumUpTokenAmounts(outputs)

  const allAddresses = uniq([...Object.keys(summedInputsAlph), ...Object.keys(summedOutputsAlph)])

  const alphDeltas: Record<Address, AttoAlphAmount> = {}
  const tokenDeltas: Record<Address, Record<Token['id'], TokenAmount>> = {}

  for (const address of allAddresses) {
    const deltaAlph = (BigInt(summedOutputsAlph[address] || 0) - BigInt(summedInputsAlph[address] || 0)).toString()

    if (deltaAlph !== '0') {
      alphDeltas[address] = deltaAlph
    }

    const inputTokens = summedInputTokens[address] || {}
    const outputTokens = summedOutputTokens[address] || {}
    const allTokenIds = uniq([...Object.keys(inputTokens), ...Object.keys(outputTokens)])

    allTokenIds.forEach((tokenId) => {
      const deltaToken = (BigInt(outputTokens[tokenId] || 0) - BigInt(inputTokens[tokenId] || 0)).toString()

      if (deltaToken !== '0') {
        if (!tokenDeltas[address]) {
          tokenDeltas[address] = {}
        }
        tokenDeltas[address][tokenId] = deltaToken
      }
    })
  }

  return {
    alph: alphDeltas,
    tokens: tokenDeltas
  }
}
