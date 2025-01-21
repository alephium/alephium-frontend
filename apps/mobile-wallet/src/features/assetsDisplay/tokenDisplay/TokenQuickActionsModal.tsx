import { selectFungibleTokenById } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { hideAsset } from '~/features/assetsDisplay/hideAssets/hiddenAssetsActions'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { showToast } from '~/utils/layout'

interface TokenQuickActionsModalProps {
  tokenId: Token['id']
}

const TokenQuickActionsModal = withModal<TokenQuickActionsModalProps>(({ id, tokenId }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const token = useAppSelector((s) => selectFungibleTokenById(s, tokenId))

  if (!token) return

  const handleAssetHide = () => {
    dispatch(hideAsset(tokenId))
    showToast({ text1: t('Asset hidden'), type: 'info' })
    dispatch(closeModal({ id }))
    sendAnalytics({ event: 'Asset hidden', props: { origin: 'TokenQuickActionsModal', assetId: tokenId } })
  }

  const openTokenDetailsModal = () => {
    dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId } }))
    dispatch(closeModal({ id }))
    sendAnalytics({ event: 'Opened token details modal', props: { origin: 'TokenQuickActionsModal' } })
  }

  return (
    <BottomModal
      modalId={id}
      title={
        <Title>
          <AssetLogo assetId={tokenId} size={26} />
          <AppText bold numberOfLines={1} size={16}>
            {token.name}
          </AppText>
        </Title>
      }
      titleAlign="left"
    >
      <QuickActionButton
        title={t('Hide asset')}
        onPress={handleAssetHide}
        iconProps={{ name: 'eye-off' }}
        variant="alert"
      />
      <QuickActionButton
        title={t('Show details')}
        onPress={openTokenDetailsModal}
        iconProps={{ name: 'more-horizontal' }}
        isLast
      />
    </BottomModal>
  )
})

export default TokenQuickActionsModal

const Title = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`
