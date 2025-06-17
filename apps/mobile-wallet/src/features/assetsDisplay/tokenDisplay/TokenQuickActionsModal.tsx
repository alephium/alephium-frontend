import { isFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { Token } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import QuickActionButtons from '~/components/buttons/QuickActionButtons'
import useHideToken from '~/features/assetsDisplay/hideTokens/useHideToken'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch } from '~/hooks/redux'

interface TokenQuickActionsModalProps {
  tokenId: Token['id']
}

const TokenQuickActionsModal = memo<TokenQuickActionsModalProps>(({ tokenId }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()
  const hideToken = useHideToken('quick_actions', dismissModal)

  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return

  const handleAssetHide = () => hideToken(tokenId)

  const openTokenDetailsModal = () => {
    dismissModal()
    dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId } }))
    sendAnalytics({ event: 'Opened token details modal', props: { origin: 'quick_actions' } })
  }

  return (
    <BottomModal2
      notScrollable
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
      <QuickActionButtons>
        {tokenId !== ALPH.id && (
          <QuickActionButton
            title={t('Hide asset')}
            onPress={handleAssetHide}
            iconProps={{ name: 'eye-off-outline' }}
            variant="alert"
          />
        )}
        <QuickActionButton
          title={t('Show details')}
          onPress={openTokenDetailsModal}
          iconProps={{ name: 'ellipsis-horizontal' }}
        />
      </QuickActionButtons>
    </BottomModal2>
  )
})

export default TokenQuickActionsModal

const Title = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`
