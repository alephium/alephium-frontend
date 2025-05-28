import { useFetchAddressesHashesWithBalance, useFetchNft } from '@alephium/shared-react'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { openBrowserAsync } from 'expo-web-browser'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import Row from '~/components/Row'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import SendButton from '~/features/send/SendButton'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

type NftModalProps = Pick<NFTImageProps, 'nftId'>

const windowWidth = Dimensions.get('window').width
const nftFullSize = windowWidth - DEFAULT_MARGIN * 4

const NftModal = memo<NftModalProps & ModalBaseProp>(({ id, nftId }) => {
  const { t } = useTranslation()
  const { dismiss } = useBottomSheetModal()

  const { data: nft } = useFetchNft({ id: nftId })
  const { data: addressesWithToken } = useFetchAddressesHashesWithBalance(nftId)

  if (!nft) return null

  const handleClose = () => dismiss(id)

  const attributes = nft.attributes
  const canViewFullSize = !nft.image.startsWith('data:image/')

  return (
    <BottomModal2 modalId={id} title={nft.name}>
      <NftImageContainer>
        <NFTImage nftId={nftId} size={nftFullSize} play sizeLimited={false} />
      </NftImageContainer>

      <ActionButtons>
        <SendButton
          origin="addressDetails"
          onPress={handleClose}
          tokenId={nftId}
          isNft
          originAddressHash={addressesWithToken.at(0)}
        />
        {canViewFullSize && (
          <ActionCardButton
            title={t('View full size')}
            onPress={() => openBrowserAsync(nft.image)}
            iconProps={{ name: 'external-link' }}
          />
        )}
      </ActionButtons>

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
    </BottomModal2>
  )
})

export default NftModal

const NftImageContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
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

const ActionButtons = styled.View`
  flex-direction: row;
  gap: 10px;
`
