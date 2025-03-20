import { NFT } from '@alephium/shared'
import { useFetchNftCollection } from '@alephium/shared-react'
import { AxiosError } from 'axios'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import ActionLink from '@/components/ActionLink'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import InfoBox from '@/components/InfoBox'
import Truncate from '@/components/Truncate'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import NFTThumbnail from '@/features/thumbnails/NFTThumbnail'
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
        <NFTThumbnail size="100%" nftId={nftId} hideIfError autoPlay />
      </NFTImageContainer>

      <NFTDataList nftId={nftId} />
    </SideModal>
  )
})

const NFTDataList = ({ nftId }: NFTDetailsModalProps) => {
  const { t } = useTranslation()
  const { data: nft, error } = useFetchNft({ id: nftId })

  const collectionId = nft?.collectionId || nft?.collectionId

  return (
    <NFTMetadataContainer>
      {error && error instanceof AxiosError && <NftMetadataError error={error} />}
      <DataList>
        <NftNameDataListRow label={t('Name')}>{nft?.name}</NftNameDataListRow>
        <DataList.Row label={t('Description')}>{nft?.description}</DataList.Row>
        <DataList.Row label={t('ID')}>
          <HashEllipsed hash={nftId} tooltipText={t('Copy ID')} />
        </DataList.Row>
        <DataList.Row label={t('Image URL')}>
          {nft?.image && (
            <ActionLink onClick={() => openInWebBrowser(nft.image)}>
              <Truncate>{nft.image}</Truncate>
            </ActionLink>
          )}
        </DataList.Row>
      </DataList>
      {nft?.attributes && (
        <DataList title={t('Attributes')}>
          {nft.attributes.map((attribute, index) => (
            <DataList.Row key={index} label={attribute.trait_type}>
              {attribute.value}
            </DataList.Row>
          ))}
        </DataList>
      )}
      {collectionId && <NFTCollectionDetails collectionId={collectionId} />}
    </NFTMetadataContainer>
  )
}

const NFTCollectionDetails = ({ collectionId }: Pick<NFT, 'collectionId'>) => {
  const { t } = useTranslation()
  const { data: nftCollectionData } = useFetchNftCollection(collectionId)

  if (!nftCollectionData) return null

  return (
    <DataList title={t('Collection')}>
      <DataList.Row label={t('Name')}>{nftCollectionData.name}</DataList.Row>
      <DataList.Row label={t('Description')}>{nftCollectionData.description}</DataList.Row>
    </DataList>
  )
}

interface NftMetadataErrorProps {
  error: AxiosError
}

const NftMetadataError = ({ error }: NftMetadataErrorProps) => {
  const { t } = useTranslation()

  return (
    <InfoBox importance="alert" Icon={AlertTriangle}>
      <ErrorContents>
        {error?.response?.config?.url && (
          <>
            <ErrorTitle>{t('Could not load NFT metadata')}</ErrorTitle>
            <span>{error.response.config.url}</span>
          </>
        )}

        <ErrorDescription>{error.message}</ErrorDescription>
      </ErrorContents>
    </InfoBox>
  )
}

export default NFTDetailsModal

const NFTImageContainer = styled.div`
  padding: 0 var(--spacing-3);
  min-height: 500px;
  display: flex;
  align-items: center;

  &:empty {
    display: none;
  }
`

const NFTMetadataContainer = styled.div`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`

const NftNameDataListRow = styled(DataList.Row)`
  font-size: var(--fontWeight-semiBold);
`

const ErrorTitle = styled.div`
  font-weight: var(--fontWeight-semiBold);
`

const ErrorDescription = styled.div`
  font-family: 'Roboto Mono';
`

const ErrorContents = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`
