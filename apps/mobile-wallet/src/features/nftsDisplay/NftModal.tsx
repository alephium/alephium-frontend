import { selectNFTById } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import Row from '~/components/Row'
import BottomModal from '~/features/modals/BottomModal'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

type NftModalProps = Pick<NFTImageProps, 'nftId'>

const windowWidth = Dimensions.get('window').width
const nftFullSize = windowWidth - DEFAULT_MARGIN * 4

const NftModal = withModal<NftModalProps>(({ id, nftId }) => {
  const nft = useAppSelector((s) => selectNFTById(s, nftId))
  const { t } = useTranslation()

  if (!nft) return null

  const attributes = nft.attributes

  return (
    <BottomModal modalId={id} title={nft.name}>
      <NftImageContainer>
        <NFTImage nftId={nftId} size={nftFullSize} />
      </NftImageContainer>

      {nft.description && (
        <NFTDescriptionContainer>
          <AppText color="secondary" size={16}>
            {nft.description}
          </AppText>
        </NFTDescriptionContainer>
      )}
      {attributes && attributes.length > 0 && (
        <>
          {attributes.map((attribute, i) => (
            <Row key={attribute.trait_type} title={attribute.trait_type} isLast={i === attributes.length - 1}>
              <AttributeValue semiBold>{attribute.value}</AttributeValue>
            </Row>
          ))}
        </>
      )}

      {!nft.image.startsWith('data:image/') && (
        <BottomButtons backgroundColor="back1" bottomInset>
          <Button title={t('View full size')} onPress={() => openBrowserAsync(nft.image)} />
        </BottomButtons>
      )}
    </BottomModal>
  )
})

export default NftModal

const NftImageContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-top: ${VERTICAL_GAP}px;
  margin-bottom: ${VERTICAL_GAP}px;
`

const NFTDescriptionContainer = styled.View`
  margin: 10px 0;
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const AttributeValue = styled(AppText)`
  margin-top: 2px;
`
