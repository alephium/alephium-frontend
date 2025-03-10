import { AddressHash, selectFungibleTokenById } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { getColors } from 'react-native-image-colors'
import styled, { useTheme } from 'styled-components/native'

import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import RoundedCard from '~/components/RoundedCard'
import TokenDetailsModalBalanceSummary from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalBalanceSummary'
import TokenDetailsModalDescription from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalDescription'
import TokenDetailsModalHeader from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalHeader'
import { TokenDetailsModalProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectDefaultAddress } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { darkTheme, lightTheme } from '~/style/themes'

const TokenDetailsModal = withModal<TokenDetailsModalProps>(({ id, tokenId, addressHash, parentModalId }) => {
  const dispatch = useAppDispatch()
  const defaultAddressHash = useAppSelector(selectDefaultAddress).hash

  const handleClose = () => {
    dispatch(closeModal({ id }))

    if (parentModalId) dispatch(closeModal({ id: parentModalId }))
  }

  return (
    <BottomModal
      modalId={id}
      title={<TokenDetailsModalHeader tokenId={tokenId} addressHash={addressHash} />}
      titleAlign="left"
    >
      <Content>
        <TokenRoundedCard addressHash={addressHash} tokenId={tokenId} />
        <ActionButtons>
          <SendButton origin="tokenDetails" originAddressHash={addressHash} tokenId={tokenId} onPress={handleClose} />
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
  addressHash?: AddressHash
}

const TokenRoundedCard = ({ tokenId, addressHash }: TokenAnimatedBackgroundProps) => {
  const theme = useTheme()
  const [dominantColor, setDominantColor] = useState<string>()
  const tokenLogoUri = useAppSelector((s) => selectFungibleTokenById(s, tokenId)?.logoURI)

  const fontColor =
    dominantColor &&
    (theme.name === 'light'
      ? colord(dominantColor).brightness() < 0.3
        ? darkTheme.font.primary
        : lightTheme.font.primary
      : colord(dominantColor).brightness() > 0.6
        ? lightTheme.font.primary
        : darkTheme.font.primary)

  useEffect(() => {
    if (!tokenLogoUri || tokenId === ALPH.id) return

    getColors(tokenLogoUri, {
      fallback: '#228B22',
      cache: true,
      key: tokenLogoUri
    }).then((r) => {
      const color = colord(
        r.platform === 'ios' ? (colord(r.background).brightness() < 0.9 ? r.background : r.secondary) : r.darkVibrant
      )

      const isBright = color.brightness() > 0.7

      setDominantColor(
        colord(
          r.platform === 'ios' ? (colord(r.background).brightness() < 0.9 ? r.background : r.secondary) : r.darkVibrant
        )
          .saturate(1.5)
          .lighten(!isBright ? (theme.name === 'light' ? 0.3 : 0.2) : 0)
          .toHex()
      )
    })
  }, [theme.name, tokenId, tokenLogoUri])

  return (
    <RoundedCard>
      <AnimatedBackground shade={dominantColor} />
      <TokenDetailsModalBalanceSummary tokenId={tokenId} addressHash={addressHash} fontColor={fontColor} />
    </RoundedCard>
  )
}

export default TokenDetailsModal

// TODO: DRY
const Content = styled.View`
  padding-top: ${VERTICAL_GAP / 2}px;
`

// TODO: DRY
const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  gap: 10px;
`
