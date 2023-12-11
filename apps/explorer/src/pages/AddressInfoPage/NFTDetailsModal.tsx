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

import { NFTCollectionUriMetaData } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Card from '@/components/Cards/Card'
import HighlightedHash from '@/components/HighlightedHash'
import { SimpleLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal, { ModalProps } from '@/components/Modal/Modal'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableRow from '@/components/Table/TableRow'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { NFTMetadataWithFile } from '@/types/assets'

interface NFTDetailsModalProps extends Omit<ModalProps, 'children'> {
  nft?: NFTMetadataWithFile
  collection?: NFTCollectionUriMetaData
}

const NFTDetailsModal = ({ nft, collection, ...props }: NFTDetailsModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal {...props}>
      {nft ? (
        <>
          <Header>
            <h2>{nft.file?.name}</h2>
            <HighlightedHash text={nft.id} middleEllipsis maxWidth="200px" textToCopy={nft.id} />
          </Header>
          <NFTImageContainer>
            {nft.file?.image ? <Image src={nft.file?.image} /> : t('Missing image')}
          </NFTImageContainer>

          <MetadataTablesContainer>
            {nft.file ? (
              <>
                <NFTDetailsContainer>
                  <Table bodyOnly>
                    <TableBody>
                      <TableRow>
                        <span>{t('Name')}</span>
                        <span>{nft.file?.name}</span>
                      </TableRow>
                      {nft.file?.description && (
                        <TableRow>
                          <span>{t('Description')}</span>
                          <span>{nft.file.description}</span>
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
                        {nft.file.attributes.map((a) => (
                          <TableRow>
                            <span>{a.trait_type}</span>
                            <span>{a.value}</span>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </NFTDetailsContainer>
                )}
              </>
            ) : (
              <CardStyled>{t('Missing metadata')}</CardStyled>
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
                      <CollectionDescription>{collection.description}</CollectionDescription>
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
  padding: 0px 25px 15px;

  @media ${deviceBreakPoints.mobile} {
    padding: 0px 12px 15px;
  }
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

const Image = styled.img`
  width: 100%;
  max-width: 600px;
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

const CollectionDescription = styled.div`
  white-space: pre-wrap;
`
