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

import { NFT } from '@alephium/shared'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTThumbnailProps {
  nft: NFT
  size: number
}

const attributeGap = 12
const screenPadding = 20

const NFTThumbnail = ({ nft, size }: NFTThumbnailProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  nft.image && Image.prefetch(nft.image)

  const attributeWidth = (Dimensions.get('window').width - (attributeGap + screenPadding * 2 + DEFAULT_MARGIN * 2)) / 2

  return (
    <>
      <TouchableOpacity onPress={() => setIsModalOpen(true)}>
        <NFTThumbnailStyled
          style={{ width: size, height: size }}
          transition={500}
          source={{ uri: nft.image }}
          allowDownscaling
        />
      </TouchableOpacity>
      <Portal>
        <BottomModal
          Content={(props) => (
            <ModalContent verticalGap {...props}>
              <ScreenSection>
                <BottomModalScreenTitle>{nft.name}</BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                <NFTImageContainer>
                  <NFTFullSizeImage source={{ uri: nft.image }} />
                </NFTImageContainer>
                {nft.description && (
                  <NFTDescriptionContainer>
                    <AppText color="secondary" size={16}>
                      {nft.description}
                    </AppText>
                  </NFTDescriptionContainer>
                )}
                {nft.attributes && nft.attributes.length > 0 && (
                  <AttributesGrid>
                    {nft.attributes.map((attribute) => (
                      <Attribute key={attribute.trait_type} style={{ width: attributeWidth }}>
                        <AttributeType color="tertiary" semiBold>
                          {attribute.trait_type}
                        </AttributeType>
                        <AttributeValue semiBold>{attribute.value}</AttributeValue>
                      </Attribute>
                    ))}
                  </AttributesGrid>
                )}
              </ScreenSection>
            </ModalContent>
          )}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Portal>
    </>
  )
}

export default NFTThumbnail

const NFTThumbnailStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const NFTImageContainer = styled.View`
  aspect-ratio: 1;
`

const NFTFullSizeImage = styled(Image)`
  flex: 1;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const NFTDescriptionContainer = styled.View`
  margin-top: 20px;
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const AttributesGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${attributeGap}px;
  margin-top: 20px;
`

const Attribute = styled.View`
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const AttributeType = styled(AppText)`
  font-weight: 500;
  font-size: 14px;
`

const AttributeValue = styled(AppText)`
  margin-top: 2px;
`
