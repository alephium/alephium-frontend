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

import { memo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Portal } from 'react-native-portalize'

import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import NFTModal from '~/components/NFTModal'
import BottomModal from '~/features/modals/DeprecatedBottomModal'

const NFTThumbnail = (props: NFTImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <TouchableOpacity onPress={() => setIsModalOpen(true)} style={{ position: 'relative' }}>
        <NFTImage {...props} />
      </TouchableOpacity>
      <Portal>
        <BottomModal
          Content={(_props) => <NFTModal nftId={props.nftId} {..._props} />}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Portal>
    </>
  )
}

export default memo(NFTThumbnail)
