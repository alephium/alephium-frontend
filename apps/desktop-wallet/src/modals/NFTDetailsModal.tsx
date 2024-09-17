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

import { NFT, throttledClient } from '@alephium/shared'
import { addressFromContractId, NFTCollectionUriMetaData } from '@alephium/web3'
import { skipToken, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useNFT from '@/api/apiDataHooks/useNFT'
import ActionLink from '@/components/ActionLink'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import NFTThumbnail from '@/components/NFTThumbnail'
import Truncate from '@/components/Truncate'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SideModal from '@/modals/SideModal'
import { openInWebBrowser } from '@/utils/misc'

export interface NFTDetailsModalProps {
  nftId: NFT['id']
}

const NFTDetailsModal = memo(({ id, nftId }: ModalBaseProp & NFTDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <SideModal id={id} title={t('NFT details')}>
      <NFTImageContainer>
        <NFTThumbnail size="100%" nftId={nftId} />
      </NFTImageContainer>

      <NFTDataList nftId={nftId} />
    </SideModal>
  )
})

const NFTDataList = ({ nftId }: NFTDetailsModalProps) => {
  const { t } = useTranslation()
  const { data: nft } = useNFT({ id: nftId })

  if (!nft) return null

  return (
    <NFTMetadataContainer>
      <DataList>
        <DataList.Row label={t('Name')}>
          <b>{nft.name}</b>
        </DataList.Row>
        <DataList.Row label={t('Description')}>{nft.description}</DataList.Row>
        <DataList.Row label={t('ID')}>
          <HashEllipsed hash={nft.id} tooltipText={t('Copy ID')} />
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
              {attribute.value}
            </DataList.Row>
          ))}
        </DataList>
      )}
      <NFTCollectionDetails collectionId={nft.collectionId} />
    </NFTMetadataContainer>
  )
}

const NFTCollectionDetails = ({ collectionId }: Pick<NFT, 'collectionId'>) => {
  const { t } = useTranslation()

  const { data: nftCollectionMetadata } = useQuery({
    queryKey: ['nfts', 'nftCollection', 'nftCollectionMetadata', collectionId],
    queryFn: !collectionId
      ? skipToken
      : async () =>
          (
            await throttledClient.explorer.tokens.postTokensNftCollectionMetadata([addressFromContractId(collectionId)])
          )[0],
    staleTime: Infinity
  })

  const collectionUri = nftCollectionMetadata?.collectionUri
  const { data: nftCollectionData } = useQuery({
    queryKey: ['nfts', 'nftCollection', 'nftCollectionData', collectionId],
    queryFn: !collectionUri
      ? skipToken
      : async () => {
          const { data } = await axios.get(collectionUri)

          if (matchesNFTCollectionUriMetaDataSchema(data)) {
            return data as NFTCollectionUriMetaData
          } else {
            throw new Error(
              `Response does not match the NFT collection metadata schema. NFT collection URI: ${collectionUri}`
            )
          }
        },
    staleTime: Infinity
  })

  if (!nftCollectionData) return null

  return (
    <DataList title={t('Collection')}>
      <DataList.Row label={t('Name')}>{nftCollectionData.name}</DataList.Row>
      <DataList.Row label={t('Description')}>{nftCollectionData.description}</DataList.Row>
    </DataList>
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

const matchesNFTCollectionUriMetaDataSchema = (nftCollection: NFTCollectionUriMetaData) =>
  typeof nftCollection.name === 'string' &&
  typeof nftCollection.image === 'string' &&
  typeof nftCollection.description === 'string'
