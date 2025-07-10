import {
  calcTxAmountsDeltaForAddress,
  getDirection,
  hasPositiveAndNegativeAmounts,
  isConfirmedTx,
  isConsolidationTx,
  isGrouplessAddressIntraTransfer,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer, isGrouplessAddressWithoutGroupIndex } from '@alephium/web3'
import { MempoolTransaction, Token, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { groupBy, map, mapValues, reduce, uniq } from 'lodash'

import { useAssetsMetadata } from '@/api/assets/assetsHooks'

export const useTransactionInfo = (tx: Transaction | MempoolTransaction, addressHash: string) => {
  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection | undefined
  let infoType: TransactionInfoType
  let lockTime: Date | undefined

  const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)

  amount = alphAmount

  const assetsMetadata = useAssetsMetadata(map(tokenAmounts, 'id'))

  if (isConsolidationTx(tx)) {
    direction = 'out'
    infoType = 'move'
  } else if (isGrouplessAddressIntraTransfer(tx)) {
    direction = isGrouplessAddressWithoutGroupIndex(addressHash) ? undefined : getDirection(tx, addressHash) // If at the groupless "level", don't show direction
    infoType = 'moveGroup'
  } else if (hasPositiveAndNegativeAmounts(amount, tokenAmounts)) {
    direction = 'swap'
    infoType = 'swap'
  } else if (!isConfirmedTx(tx)) {
    direction = getDirection(tx, addressHash)
    infoType = 'pending'
  } else {
    direction = getDirection(tx, addressHash)
    infoType = direction
  }

  lockTime = (tx.outputs ?? []).reduce(
    (a, b) =>
      a > new Date((b as explorer.AssetOutput).lockTime ?? 0) ? a : new Date((b as explorer.AssetOutput).lockTime ?? 0),
    new Date(0)
  )
  lockTime = lockTime?.toISOString() === new Date(0).toISOString() ? undefined : lockTime

  const groupedTokens = tokenAmounts.reduce(
    (acc, token) => {
      const fungibleToken = assetsMetadata.fungibleTokens.find((i) => i.id === token.id)
      const nonFungibleToken = assetsMetadata.nfts.find((i) => i.id === token.id)

      return fungibleToken
        ? { ...acc, fungible: [...acc.fungible, { ...fungibleToken, amount: token.amount }] }
        : nonFungibleToken
          ? { ...acc, 'non-fungible': [...acc['non-fungible'], { ...nonFungibleToken, amount: token.amount }] }
          : acc
    },
    {
      fungible: [] as ((typeof assetsMetadata.fungibleTokens)[number] & { amount: bigint })[],
      'non-fungible': [] as ((typeof assetsMetadata.nfts)[number] & { amount: bigint })[]
    }
  )

  const assets = { alph: { ...ALPH, amount }, ...groupedTokens }

  return {
    assets,
    direction,
    infoType,
    lockTime
  }
}

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

  const utxosGroupedByAddress = groupBy(validUtxos, 'address')
  const summed = mapValues(utxosGroupedByAddress, (addressUtxos) =>
    reduce(addressUtxos, (sum, utxo) => (BigInt(sum) + BigInt(utxo.attoAlphAmount || 0)).toString(), '0')
  )

  return summed
}

export const sumUpTokenAmounts = (utxos: UTXO[]): Record<Address, Record<Token['id'], TokenAmount>> => {
  const validUtxos = utxos.filter((utxo) => utxo.address && utxo.tokens && utxo.tokens.length > 0)

  const utxosGroupedByAddress = groupBy(validUtxos, 'address')
  const summed = mapValues(utxosGroupedByAddress, (addressUtxos) => {
    const tokenSums: Record<Token['id'], TokenAmount> = {}

    for (const utxo of addressUtxos) {
      for (const token of utxo.tokens || []) {
        tokenSums[token.id] = (BigInt(tokenSums[token.id] || 0) + BigInt(token.amount)).toString()
      }
    }

    return tokenSums
  })

  return summed
}

export const calculateIoAmountsDelta = (
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
