import { selectFungibleTokenById } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import { useMemo } from 'react'
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
import { unhideAsset } from '~/features/assetsDisplay/hideAssets/hiddenAssetsActions'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesHiddenFungibleTokens } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'

interface HiddenAssetsScreenProps extends StackScreenProps<RootStackParamList, 'HiddenAssetsScreen'>, ScreenProps {}

const HiddenAssetsScreen = ({ navigation, ...props }: HiddenAssetsScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const selectAddressesHiddenFungibleTokens = useMemo(makeSelectAddressesHiddenFungibleTokens, [])
  const hiddenFungibleTokens = useAppSelector(selectAddressesHiddenFungibleTokens)

  const handleAddAssetPress = () => {
    dispatch(openModal({ name: 'SelectAssetToHideModal' }))
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
            {hiddenFungibleTokens.map(({ id }, i) => (
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
  const token = useAppSelector((s) => selectFungibleTokenById(s, tokenId))

  if (!token) return

  const handleAssetUnhide = () => {
    dispatch(unhideAsset(tokenId))
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
      rightSideContent={<Button iconProps={{ name: 'x' }} squared compact onPress={handleAssetUnhide} />}
      isLast={isLast}
      onPress={openTokenDetailsModal}
    />
  )
}

export default HiddenAssetsScreen

const FungibleTokensList = styled.View`
  gap: ${VERTICAL_GAP / 2}px;
`
