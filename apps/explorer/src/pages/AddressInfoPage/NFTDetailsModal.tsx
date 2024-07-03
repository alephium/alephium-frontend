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

import { NFTCollectionUriMetaData } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { queries } from '@/api'
import Card from '@/components/Cards/Card'
import HighlightedHash from '@/components/HighlightedHash'
import { SimpleLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal, { ModalProps } from '@/components/Modal/Modal'
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
  const { data: dataType } = useQuery({
    ...queries.assets.NFTsData.type(nft?.file?.image || ''),
    enabled: !!nft?.file?.image
  })

  return (
    <Modal {...props}>
      {nft ? (
        <>
          <Header>
            {nft.file?.name && <NFTName>{nft.file.name}</NFTName>}
            <HighlightedHash text={nft.id} middleEllipsis maxWidth="200px" textToCopy={nft.id} />
          </Header>
          <NFTImageContainer>
            {nft.file?.image ? (
              dataType === 'image' ? (
                <Image src={nft.file.image} />
              ) : dataType === 'video' ? (
                <video src={nft.file.image} autoPlay loop width="100%" height="100%" />
              ) : (
                t('Unsupported media type')
              )
            ) : (
              t('Missing image')
            )}
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

const Paragraph = styled.div`
  white-space: pre-wrap;
`
