import { isFT, unhideToken } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { Token } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ListItem from '~/components/ListItem'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'

interface HiddenTokensScreenProps extends StackScreenProps<RootStackParamList, 'HiddenTokensScreen'>, ScreenProps {}

const HiddenTokensScreen = ({ navigation, ...props }: HiddenTokensScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const hiddenFungibleTokens = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)

  const handleAddAssetPress = () => {
    dispatch(openModal({ name: 'SelectTokenToHideModal' }))
    sendAnalytics({ event: 'Clicked on button to add an asset to hidden list' })
  }

  return (
    <ScrollScreen
      fill
      headerOptions={{ headerTitle: t('Hidden assets'), type: 'stack' }}
      screenTitle={t('Hidden assets')}
      screenIntro={t('Here is the list of assets you are hiding')}
      contentPaddingTop
      {...props}
    >
      <ScreenSection fill>
        {hiddenFungibleTokens.length === 0 ? (
          <EmptyPlaceholder style={{ flexGrow: 0 }}>
            <AppText size={32}>✨</AppText>
            <AppText>{t('No assets are hidden')}</AppText>
          </EmptyPlaceholder>
        ) : (
          <FungibleTokensList>
            {hiddenFungibleTokens.map((id, i) => (
              <FungibleTokensListItem key={id} tokenId={id} isLast={i === hiddenFungibleTokens.length - 1} />
            ))}
          </FungibleTokensList>
        )}
      </ScreenSection>
      <BottomButtons>
        <Button title={t('Hide an asset')} type="primary" onPress={handleAddAssetPress} iconProps={{ name: 'plus' }} />
      </BottomButtons>
    </ScrollScreen>
  )
}

interface FungibleTokensListItemProps {
  tokenId: Token['id']
  isLast: boolean
}

const FungibleTokensListItem = ({ tokenId, isLast }: FungibleTokensListItemProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return

  const handleTokenUnhide = () => {
    dispatch(unhideToken(tokenId))
    showToast({ text1: t('Asset unhidden'), type: 'success' })
    sendAnalytics({ event: 'Clicked on button to unhide an asset' })
  }

  const openTokenDetailsModal = () => {
    dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId } }))
    sendAnalytics({ event: 'Opened token details modal', props: { origin: 'hidden_assets_list_item' } })
  }

  return (
    <ListItem
      icon={<AssetLogo assetId={token.id} size={32} />}
      title={token.name}
      rightSideContent={<Button iconProps={{ name: 'x' }} squared compact onPress={handleTokenUnhide} />}
      isLast={isLast}
      onPress={openTokenDetailsModal}
    />
  )
}

export default HiddenTokensScreen

const FungibleTokensList = styled.View`
  gap: ${VERTICAL_GAP / 2}px;
`
