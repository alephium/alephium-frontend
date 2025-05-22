import { NonSensitiveAddressData } from '@alephium/keyring'
import { throttledClient } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'

import { deriveAddresses, getGapFromLastActiveAddress, splitResultsArrayIntoOneArrayPerGroup } from '@/utils/addresses'

export const discoverAndCacheActiveAddresses = async (
  skipIndexesForAddressesWithGroup: number[] = [],
  skipIndexesForGrouplessAddresses: number[] = [],
  minGap = 5
): Promise<NonSensitiveAddressData[]> => {
  const addressesPerGroup = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (): NonSensitiveAddressData[] => [])
  const activeAddresses: NonSensitiveAddressData[] = []
  const _skipIndexesForAddressesWithGroup = Array.from(skipIndexesForAddressesWithGroup)
  const _skipIndexesForGrouplessAddresses = Array.from(skipIndexesForGrouplessAddresses)

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    const newAddresses = deriveAddresses({
      group,
      amount: minGap,
      keyType: 'default',
      skipIndexes: _skipIndexesForAddressesWithGroup
    })
    addressesPerGroup[group] = newAddresses
    _skipIndexesForAddressesWithGroup.push(...newAddresses.map((address) => address.index))
  }

  const addressesToCheckIfActive = addressesPerGroup.flat().map((address) => address.hash)
  const results = await getActiveAddressesResults(addressesToCheckIfActive)
  const resultsPerGroup = splitResultsArrayIntoOneArrayPerGroup(results, minGap)

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
      addressesPerGroup[group],
      resultsPerGroup[group]
    )

    let gapPerGroup = gap
    activeAddresses.push(...newActiveAddresses)

    while (gapPerGroup < minGap) {
      const remainingGap = minGap - gapPerGroup
      const newAddresses = deriveAddresses({
        group,
        amount: remainingGap,
        keyType: 'default',
        skipIndexes: _skipIndexesForAddressesWithGroup
      })
      _skipIndexesForAddressesWithGroup.push(...newAddresses.map((address) => address.index))

      const newAddressesToCheckIfActive = newAddresses.map((address) => address.hash)
      const results = await getActiveAddressesResults(newAddressesToCheckIfActive)

      const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
        newAddresses,
        results,
        gapPerGroup
      )
      gapPerGroup = gap
      activeAddresses.push(...newActiveAddresses)
    }
  }

  // TODO: Implement groupless address discovery

  return activeAddresses
}

const getActiveAddressesResults = async (addressesToCheckIfActive: string[]): Promise<boolean[]> => {
  const QUERY_LIMIT = 80
  const results: boolean[] = []
  let queryPage = 0

  while (addressesToCheckIfActive.length > results.length) {
    const addressesToQuery = addressesToCheckIfActive.slice(queryPage * QUERY_LIMIT, ++queryPage * QUERY_LIMIT)
    const response = await throttledClient.explorer.addresses.postAddressesUsed(addressesToQuery)

    results.push(...response)
  }

  return results
}
