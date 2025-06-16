import { AddressHash, isFT, isUnlistedFT, TokenId } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { Optional } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import ListItem, { ListItemProps } from '~/components/ListItem'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface FtListItemProps extends Optional<ListItemProps, 'title' | 'icon'> {
  tokenId: TokenId
  addressHash?: AddressHash
  onTokenDetailsModalClose?: () => void
}

const FtListItem = ({ tokenId, addressHash, ...props }: FtListItemProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  const openTokenDetailsModal = () => {
    dispatch(
      openModal({ name: 'TokenDetailsModal', props: { tokenId, addressHash, onClose: props.onTokenDetailsModalClose } })
    )
    sendAnalytics({ event: 'Opened token details modal', props: { origin: 'token_list_item' } })
  }

  const openTokenQuickActionsModal = () => {
    vibrate(ImpactStyle.Heavy)
    dispatch(openModal({ name: 'TokenQuickActionsModal', props: { tokenId } }))
    sendAnalytics({ event: 'Opened token quick actions modal' })
  }

  return (
    <ListItem
      title={token.name}
      subtitle={
        isUnlistedFT(token) && (
          <UnverifiedBadge>
            <AppText size={10} color="tertiary">
              {t('No metadata')}
            </AppText>
          </UnverifiedBadge>
        )
      }
      icon={<AssetLogo assetId={tokenId} size={32} />}
      onPress={openTokenDetailsModal}
      onLongPress={openTokenQuickActionsModal}
      {...props}
    />
  )
}

export default FtListItem

const UnverifiedBadge = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 1px 2px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 3px;
`
