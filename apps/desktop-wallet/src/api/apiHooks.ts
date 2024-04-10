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
  AddressFungibleToken,
  isFungible,
  useGetAddressesTokensBalancesQuery,
  useGetAssetsMetadata
} from '@alephium/shared'

import { useAppSelector } from '@/hooks/redux'

// TODO: Extract these hooks to shared

export const useAssetsMetadataForCurrentNetwork = (assetIds: string[]) => {
  const networkName = useAppSelector((state) => state.network.name)
  return useGetAssetsMetadata(assetIds, networkName)
}

export const useAddressesAssets = (addressHashes: string[]) => {
  const { data: addressesTokens } = useGetAddressesTokensBalancesQuery(addressHashes)
  const addressesAssetsMetadata = useAssetsMetadataForCurrentNetwork(
    addressesTokens?.flatMap((a) => a.tokenBalances.map((t) => t.id)) || []
  )

  return (
    addressesTokens?.map((t) => ({
      addressHash: t.addressHash,
      assets: t.tokenBalances.map((b) => ({ ...b, ...addressesAssetsMetadata.find((a) => a.id === b.id) }))
    })) || []
  )
}

export const useAddressesFungibleTokens = (addressHashes: string[]) => {
  const addressesAssets = useAddressesAssets(addressHashes)
  return addressesAssets.map((a) => ({
    addressHash: a.addressHash,
    fungibleTokens: a.assets.filter(isFungible) as AddressFungibleToken[]
  }))
}
