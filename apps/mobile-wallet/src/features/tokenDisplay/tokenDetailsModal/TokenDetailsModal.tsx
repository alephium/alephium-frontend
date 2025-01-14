import { selectFungibleTokenById } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { getColors } from 'react-native-image-colors'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import RoundedCard from '~/components/RoundedCard'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import ActionCardSendButton from '~/features/send/ActionCardSendButton'
import TokenDetailsModalBalanceSummary from '~/features/tokenDisplay/tokenDetailsModal/TokenDetailsModalBalanceSummary'
import TokenDetailsModalDescription from '~/features/tokenDisplay/tokenDetailsModal/TokenDetailsModalDescription'
import TokenDetailsModalHeader from '~/features/tokenDisplay/tokenDetailsModal/TokenDetailsModalHeader'
import { TokenDetailsModalProps } from '~/features/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectDefaultAddress } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

const TokenDetailsModal = withModal<TokenDetailsModalProps>(({ id, tokenId, addressHash, parentModalId }) => {
  const dispatch = useAppDispatch()
  const defaultAddressHash = useAppSelector(selectDefaultAddress).hash

  const handleClose = () => {
    dispatch(closeModal({ id }))

    if (parentModalId) dispatch(closeModal({ id: parentModalId }))
  }

  return (
    <BottomModal modalId={id}>
      <TokenDetailsModalHeader tokenId={tokenId} addressHash={addressHash} />
      <Content>
        <RoundedCard>
          <TokenAnimatedBackground tokenId={tokenId} />
          <TokenDetailsModalBalanceSummary tokenId={tokenId} addressHash={addressHash} />
        </RoundedCard>

        <ActionButtons>
          <ActionCardSendButton origin="tokenDetails" addressHash={addressHash} onPress={handleClose} />
          <ActionCardReceiveButton origin="tokenDetails" addressHash={addressHash} onPress={handleClose} />
          {tokenId === ALPH.id && (
            <ActionCardBuyButton origin="tokenDetails" receiveAddressHash={addressHash || defaultAddressHash} />
          )}
        </ActionButtons>
        <TokenDetailsModalDescription tokenId={tokenId} addressHash={addressHash} />
      </Content>
    </BottomModal>
  )
})

interface TokenAnimatedBackgroundProps {
  tokenId: Token['id']
}

const TokenAnimatedBackground = ({ tokenId }: TokenAnimatedBackgroundProps) => {
  const [dominantColor, setDominantColor] = useState<string>()
  const token = useAppSelector((state) => selectFungibleTokenById(state, tokenId))

  useEffect(() => {
    const logoURI = token?.logoURI

    if (!logoURI) return

    getColors(logoURI, {
      fallback: '#228B22',
      cache: true,
      key: logoURI
    }).then((r) =>
      setDominantColor(
        r.platform === 'ios' ? (colord(r.background).brightness() < 0.9 ? r.background : r.secondary) : r.vibrant
      )
    )
  })

  return <AnimatedBackground shade={dominantColor} isAnimated />
}

export default TokenDetailsModal

// TODO: DRY
const Content = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`

// TODO: DRY
const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP}px;
  flex-direction: row;
  gap: 10px;
`
