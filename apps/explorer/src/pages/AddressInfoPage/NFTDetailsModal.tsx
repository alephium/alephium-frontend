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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
}

const NFTDetailsModal = ({ nft, ...props }: NFTDetailsModalProps) => {
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
            <Image src={nft.file?.image} />
          </NFTImageContainer>

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
                      <SimpleLink to={nft.file.image}>{nft.file.image}</SimpleLink>
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
        <LoadingSpinner />
      )}
    </Modal>
  )
}

export default NFTDetailsModal

const Header = styled.div`
  padding: 10px 25px;

  @media ${deviceBreakPoints.mobile} {
    padding: 6px 12px;
  }
`

const NFTImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
  padding: 25px;
  background-color: ${({ theme }) => theme.bg.background2};
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
