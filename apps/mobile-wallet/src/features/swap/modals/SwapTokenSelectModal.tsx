import { AddressHash, isFT, TokenId } from '@alephium/shared/types'
import { useFetchAddressSingleTokenBalances, useFetchToken } from '@alephium/shared-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import Amount from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import useFetchSwappableTokens from '~/features/swap/hooks/useFetchSwappableTokens'

interface SwapTokenSelectModalProps {
  addressHash: AddressHash
  onSelectToken: (tokenId: TokenId) => void
  pairedWithTokenId?: TokenId // when set, only tokens that pair with it are shown (the "to" universe)
  excludeTokenId?: TokenId // the token selected on the other side, so it can't be picked twice
}

const SwapTokenSelectModal = memo<SwapTokenSelectModalProps>(
  ({ addressHash, onSelectToken, pairedWithTokenId, excludeTokenId }) => {
    const { t } = useTranslation()
    const { dismissModal } = useModalContext()
    const { tokenIds } = useFetchSwappableTokens(pairedWithTokenId)

    const selectableTokenIds = tokenIds.filter((id) => id !== excludeTokenId)

    const handleTokenPress = (tokenId: TokenId) => {
      onSelectToken(tokenId)
      dismissModal()
    }

    return (
      <BottomModal
        title={t('Select token')}
        flashListProps={{
          data: selectableTokenIds,
          renderItem: ({ item, index }) => (
            <SwapTokenSelectListItem
              tokenId={item}
              addressHash={addressHash}
              isLast={index === selectableTokenIds.length - 1}
              onPress={() => handleTokenPress(item)}
            />
          )
        }}
      />
    )
  }
)

export default SwapTokenSelectModal

interface SwapTokenSelectListItemProps {
  tokenId: TokenId
  addressHash: AddressHash
  isLast: boolean
  onPress: () => void
}

const SwapTokenSelectListItem = ({ tokenId, addressHash, isLast, onPress }: SwapTokenSelectListItemProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })
  const availableBalance = tokenBalances ? BigInt(tokenBalances.availableBalance) : undefined

  if (!token) return null

  const isListedFt = isFT(token)

  return (
    <ListItem
      isLast={isLast}
      title={isListedFt ? token.name : tokenId}
      icon={<AssetLogo assetId={tokenId} size={32} />}
      onPress={onPress}
      height={64}
      subtitle={
        availableBalance !== undefined ? (
          isListedFt ? (
            <Amount value={availableBalance} suffix={token.symbol} decimals={token.decimals} medium color="tertiary" />
          ) : (
            <Amount value={availableBalance} isUnknownToken medium color="tertiary" />
          )
        ) : undefined
      }
    />
  )
}
