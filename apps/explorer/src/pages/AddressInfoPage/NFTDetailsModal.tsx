/*
Copyright 2018 - 2023 The Alephium Authors
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

import styled from 'styled-components'

import HighlightedHash from '@/components/HighlightedHash'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal, { ModalProps } from '@/components/Modal/Modal'
import { NFTMetadataWithFile } from '@/types/assets'

interface NFTDetailsModalProps extends Omit<ModalProps, 'children'> {
  nft?: NFTMetadataWithFile
}

const NFTDetailsModal = ({ nft, ...props }: NFTDetailsModalProps) => (
  <Modal {...props}>
    {nft ? (
      <>
        <h2>{nft?.file?.name}</h2>
        <HighlightedHash text={nft.id} middleEllipsis maxWidth="200px" textToCopy={nft.id} />
        <NFTImageContainer></NFTImageContainer>
      </>
    ) : (
      <LoadingSpinner />
    )}
  </Modal>
)

export default styled(NFTDetailsModal)`
  padding: 20px 30px;
`

const ModalHeader = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 15px;
`

const NFTImageContainer = styled.div``
