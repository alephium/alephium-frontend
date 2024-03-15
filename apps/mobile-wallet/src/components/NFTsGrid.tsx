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

import { AddressHash, NFT } from '@alephium/shared'
import { useMemo } from 'react'
import { Dimensions } from 'react-native'

import { ModalContentProps, ModalFlatListContent } from '~/components/layout/ModalContent'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesNFTs } from '~/store/addressesSlice'

interface NFTsGridProps extends ModalContentProps {
  addressHash?: AddressHash
  nfts?: NFT[]
  nftsPerRow?: number
  nftSize?: number
}

const gap = 12
const screenPadding = 20

const NFTsGrid = ({ addressHash, nfts: nftsProp, nftSize, nftsPerRow = 3, ...props }: NFTsGridProps) => {
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  const data = nftsProp ?? nfts
  const columns = data.length < nftsPerRow ? data.length : nftsPerRow
  const { width: windowWidth } = Dimensions.get('window')
  const totalGapSize = (columns - 1) * gap + screenPadding * 2
  const size = nftSize ?? (windowWidth - totalGapSize) / columns

  return (
    <ModalFlatListContent
      data={data}
      verticalGap
      keyExtractor={(item) => item.id}
      renderItem={({ item: nft }) => <NFTThumbnail key={nft.id} nft={nft} size={size} />}
      numColumns={columns}
      columnWrapperStyle={{ justifyContent: 'space-between', gap: 15 }}
      {...props}
    />
  )
}

export default NFTsGrid
