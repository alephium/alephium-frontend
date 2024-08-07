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

import { selectNFTById } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN } from '~/style/globalStyle'

type NFTModalProps = ModalContentProps & Pick<NFTImageProps, 'nftId'>

const attributeGap = 12
const windowWidth = Dimensions.get('window').width
const nftFullSize = windowWidth - DEFAULT_MARGIN * 4
const attributeWidth = (nftFullSize - attributeGap) / 2

const NFTModal = ({ nftId, ...props }: NFTModalProps) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const { t } = useTranslation()

  if (!nft) return null

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>{nft.name}</BottomModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <NFTFullSizeImage nftId={nftId} size={nftFullSize} />

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

      {!nft.image.startsWith('data:image/') && (
        <ScreenSection>
          <Button title={t('View full size')} onPress={() => openBrowserAsync(nft.image)} />
        </ScreenSection>
      )}
    </ModalContent>
  )
}

export default NFTModal

const NFTFullSizeImage = styled(NFTImage)`
  flex: 1;
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
