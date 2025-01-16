import { NFTCollectionUriMetaData } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Card from '@/components/Cards/Card'
import HighlightedHash from '@/components/HighlightedHash'
import { SimpleLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal, { ModalProps } from '@/components/Modal/Modal'
import NFTThumbnail from '@/components/NFTThumbnail'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableRow from '@/components/Table/TableRow'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { NFTMetadata } from '@/types/assets'

interface NFTDetailsModalProps extends Omit<ModalProps, 'children'> {
  nft?: NFTMetadata
  collection?: NFTCollectionUriMetaData
}

const NFTDetailsModal = ({ nft, collection, ...props }: NFTDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal {...props}>
      {nft ? (
        <>
          <Header>
            {nft.file?.name && <NFTName>{nft.file.name}</NFTName>}
            <HighlightedHash text={nft.id} middleEllipsis maxWidth="200px" textToCopy={nft.id} />
          </Header>
          <NFTImageContainer>
            <NFTThumbnail src={nft.file?.image} autoPlay />
          </NFTImageContainer>

          <MetadataTablesContainer>
            {nft.file ? (
              <>
                <NFTDetailsContainer>
                  <Table bodyOnly>
                    <TableBody>
                      {nft.file?.name && (
                        <TableRow>
                          <span>{t('Name')}</span>
                          <span>{nft.file.name}</span>
                        </TableRow>
                      )}
                      {nft.file?.description && (
                        <TableRow>
                          <span>{t('Description')}</span>
                          <Paragraph>{nft.file.description}</Paragraph>
                        </TableRow>
                      )}
                      {nft.file?.image && (
                        <TableRow>
                          <span>{t('Image URL')}</span>
                          <LinkContainer>
                            <SimpleLink to={nft.file.image} newTab>
                              {nft.file.image}
                            </SimpleLink>
                          </LinkContainer>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </NFTDetailsContainer>
                {nft.file?.attributes && (
                  <NFTDetailsContainer>
                    <h3>{t('Attributes')}</h3>
                    <Table bodyOnly>
                      <TableBody>
                        {nft.file.attributes.map((a, i) => (
                          <TableRow key={i}>
                            <span>{a.trait_type}</span>
                            <span>{a.value.toString()}</span>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </NFTDetailsContainer>
                )}
              </>
            ) : (
              <CardStyled>{t('Wrong/old format')}</CardStyled>
            )}
            {collection && (
              <NFTDetailsContainer>
                <h3>{t('Collection')}</h3>
                <Table bodyOnly>
                  <TableBody>
                    <TableRow>
                      <span>{t('Collection name')}</span>
                      <span>{collection.name}</span>
                    </TableRow>
                    <TableRow>
                      <span>{t('Collection desc.')}</span>
                      <Paragraph>{collection.description}</Paragraph>
                    </TableRow>
                  </TableBody>
                </Table>
              </NFTDetailsContainer>
            )}
          </MetadataTablesContainer>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </Modal>
  )
}

export default NFTDetailsModal

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 25px;

  @media ${deviceBreakPoints.mobile} {
    padding: 0px 12px 15px;
  }
`

const NFTName = styled.h2`
  margin: 0;
`

const MetadataTablesContainer = styled.div`
  margin: 10px 0 20px;
`

const NFTImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
  background-color: ${({ theme }) => theme.bg.background2};
  min-height: 300px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`

const NFTDetailsContainer = styled.div`
  padding: 0 25px;
  margin-top: 25px;
`

const LinkContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardStyled = styled(Card)`
  justify-content: center;
  align-items: center;
  margin: 25px;
`

const Paragraph = styled.div`
  white-space: pre-wrap;
`
