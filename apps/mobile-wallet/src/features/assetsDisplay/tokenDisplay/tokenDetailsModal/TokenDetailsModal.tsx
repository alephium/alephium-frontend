import { AddressHash, isListedFT, selectDefaultAddressHash } from '@alephium/shared'
import {
  useFetchAddressSingleTokenBalances,
  useFetchToken,
  useFetchWalletSingleTokenBalances
} from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getColors } from 'react-native-image-colors'
import styled, { useTheme } from 'styled-components/native'

import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import RoundedCard from '~/components/RoundedCard'
import TokenDetailsModalBalanceSummary, {
  TokenDetailsModalBalanceSummaryProps
} from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalBalanceSummary'
import TokenDetailsModalDescription from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalDescription'
import TokenDetailsModalHeader from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModalHeader'
import {
  TokenDetailsModalCommonProps,
  TokenDetailsModalProps
} from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { darkTheme, lightTheme } from '~/style/themes'

const TokenDetailsModal = withModal<TokenDetailsModalProps>(({ id, tokenId, addressHash, parentModalId }) => {
  const { dismiss } = useBottomSheetModal()

  const handleClose = () => {
    dismiss(id)

    if (parentModalId) dismiss(parentModalId)
  }

  return (
    <BottomModal2 notScrollable modalId={id} title={<TokenDetailsModalHeader tokenId={tokenId} />} titleAlign="left">
      <Content>
        <TokenRoundedCard addressHash={addressHash} tokenId={tokenId} />
        <ActionButtons>
          <SendButton origin="tokenDetails" originAddressHash={addressHash} tokenId={tokenId} onPress={handleClose} />
          <ActionCardReceiveButton origin="tokenDetails" addressHash={addressHash} onPress={handleClose} />
          <TokenBuyButton tokenId={tokenId} addressHash={addressHash} />
        </ActionButtons>
        <TokenDetailsModalDescription tokenId={tokenId} />
      </Content>
    </BottomModal2>
  )
})

const TokenBuyButton = ({ tokenId, addressHash }: TokenDetailsModalCommonProps) => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  if (!defaultAddressHash || tokenId !== ALPH.id) return null

  return <ActionCardBuyButton origin="tokenDetails" receiveAddressHash={addressHash || defaultAddressHash} />
}

interface TokenAnimatedBackgroundProps {
  tokenId: Token['id']
  addressHash?: AddressHash
}

const TokenRoundedCard = ({ tokenId, addressHash }: TokenAnimatedBackgroundProps) => {
  const theme = useTheme()
  const [dominantColor, setDominantColor] = useState<string>()
  const { data: token } = useFetchToken(tokenId)

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
    if (tokenId === ALPH.id || !token) return

    const tokenLogoUri = isListedFT(token) ? token.logoURI : undefined

    if (!tokenLogoUri) return

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
  }, [theme.name, token, tokenId])

  return (
    <RoundedCard>
      <AnimatedBackground shade={dominantColor} />

      {addressHash ? (
        <AddressTokenDetailsModalBalanceSummary addressHash={addressHash} tokenId={tokenId} fontColor={fontColor} />
      ) : (
        <WalletTokenDetailsModalBalanceSummary tokenId={tokenId} fontColor={fontColor} />
      )}
    </RoundedCard>
  )
}

export default TokenDetailsModal

const AddressTokenDetailsModalBalanceSummary = ({
  addressHash,
  ...props
}: Required<TokenDetailsModalCommonProps> & Pick<TokenDetailsModalBalanceSummaryProps, 'fontColor'>) => {
  const { t } = useTranslation()
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId: props.tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return <TokenDetailsModalBalanceSummary label={t('Address balance')} balance={balance} {...props} />
}

const WalletTokenDetailsModalBalanceSummary = (
  props: TokenDetailsModalCommonProps & Pick<TokenDetailsModalBalanceSummaryProps, 'fontColor'>
) => {
  const { t } = useTranslation()
  const { data: tokenBalances } = useFetchWalletSingleTokenBalances({ tokenId: props.tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return <TokenDetailsModalBalanceSummary label={t('Wallet balance')} balance={balance} {...props} />
}

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
