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
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import BottomModal from '~/components/layout/BottomModal'
import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import NFTModal from '~/components/NFTModal'

const NFTThumbnail = (props: NFTImageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <ThumbnailCard onPress={() => setIsModalOpen(true)} style={{ position: 'relative' }}>
        <NFTImage {...props} size={100} />
      </ThumbnailCard>
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

const ThumbnailCard = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.highlight : theme.bg.back2)};
  border-radius: 9px;
  width: 116px;
  height: 116px;
`
