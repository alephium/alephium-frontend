import { ALPH } from '@alephium/token-list'
import styled, { useTheme } from 'styled-components/native'

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
  const theme = useTheme()

  const handleClose = () => {
    dispatch(closeModal({ id }))

    if (parentModalId) dispatch(closeModal({ id: parentModalId }))
  }

  return (
    <BottomModal modalId={id}>
      <TokenDetailsModalHeader tokenId={tokenId} addressHash={addressHash} />
      <Content>
        <RoundedCard>
          <AnimatedBackground shade={theme.bg.contrast} isAnimated />
          <TokenDetailsModalBalanceSummary tokenId={tokenId} addressHash={addressHash} onPress={handleClose} />
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
