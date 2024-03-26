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

import { NFT, selectNFTById } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import DataRow from '@/components/DataRow'
import NFTThumbnail from '@/components/NFTThumbnail'
import { BoxContainer } from '@/components/PageComponents/PageContainers'
import { useAppSelector } from '@/hooks/redux'
import SideModal from '@/modals/SideModal'

interface TransactionDetailsModalProps {
  NFTId: NFT['id']
  onClose: () => void
}

const NFTDetailsModal = ({ NFTId, onClose }: TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const nft = useAppSelector((s) => selectNFTById(s, NFTId))

  return nft ? (
    <SideModal onClose={onClose} title={t('NFT details')}>
      <NFTImageContainer>
        <NFTThumbnail size="100%" nft={nft} />
        <h2>{}</h2>
        <BoxContainer>
          <DataRow label={t('Name')}>{nft.name}</DataRow>
          <DataRow label={t('Description')}>{nft.description}</DataRow>
          <DataRow label={t('Image URL')}>{nft.image}</DataRow>
        </BoxContainer>
      </NFTImageContainer>
    </SideModal>
  ) : null
}

export default NFTDetailsModal

const NFTImageContainer = styled.div`
  padding: 20px;
`
