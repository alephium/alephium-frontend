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

import { NFT } from '@alephium/shared'

import NFTsGrid from '~/components/NFTsGrid'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'

interface NftGridModalProps {
  nftsData: NFT[]
}

const NftGridModal = withModal<NftGridModalProps>(({ id, nftsData }) => (
  <BottomModalFlashList modalId={id} noPadding>
    {(props) => <NFTsGrid nfts={nftsData} {...props} />}
  </BottomModalFlashList>
))

export default NftGridModal
