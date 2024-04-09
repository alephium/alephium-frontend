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

import { NFT, selectNFTById, useGetNftCollectionDataQuery, useGetNftCollectionMetadataQuery } from '@alephium/shared'
import { skipToken } from '@reduxjs/toolkit/query'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import NFTThumbnail from '@/components/NFTThumbnail'
import Truncate from '@/components/Truncate'
import { useAppSelector } from '@/hooks/redux'
import SideModal from '@/modals/SideModal'
import { openInWebBrowser } from '@/utils/misc'

interface NFTDetailsModalProps {
  nftId: NFT['id']
  onClose: () => void
}

const NFTDetailsModal = ({ nftId, onClose }: NFTDetailsModalProps) => {
  const { t } = useTranslation()
  const nft = useAppSelector((s) => selectNFTById(s, nftId))

  const nftCollectionMetadata = useGetNftCollectionMetadataQuery(nft?.collectionId ?? skipToken)
  const nftCollectionData = useGetNftCollectionDataQuery(nftCollectionMetadata.data?.collectionUri ?? skipToken)

  if (!nft) return null

  return (
    <SideModal onClose={onClose} title={t('NFT details')}>
      <NFTImageContainer>
        <NFTThumbnail size="100%" nftId={nftId} />
      </NFTImageContainer>
      <NFTMetadataContainer>
        <DataList>
          <DataList.Row label={t('Name')}>
            <b>{nft.name}</b>
          </DataList.Row>
          <DataList.Row label={t('Description')}>{nft.description}</DataList.Row>
          <DataList.Row label={t('ID')}>
            <HashEllipsed hash={nft.id} />
          </DataList.Row>
          <DataList.Row label={t('Image URL')}>
            <ActionLink onClick={() => openInWebBrowser(nft.image)}>
              <Truncate>{nft.image}</Truncate>
            </ActionLink>
          </DataList.Row>
        </DataList>
        {nft.attributes && (
          <DataList title={t('Attributes')}>
            {nft.attributes.map((attribute, index) => (
              <DataList.Row key={index} label={attribute.trait_type}>
                {attribute.value.toString()}
              </DataList.Row>
            ))}
          </DataList>
        )}
        {nftCollectionData?.data && (
          <DataList title={t('Collection')}>
            <DataList.Row label={t('Name')}>{nftCollectionData.data.name}</DataList.Row>
            <DataList.Row label={t('Description')}>{nftCollectionData.data.description}</DataList.Row>
          </DataList>
        )}
      </NFTMetadataContainer>
    </SideModal>
  )
}

export default NFTDetailsModal

const NFTImageContainer = styled.div`
  padding: var(--spacing-3);
`

const NFTMetadataContainer = styled.div`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`
