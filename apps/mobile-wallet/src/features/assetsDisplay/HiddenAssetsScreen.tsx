import { StackScreenProps } from '@react-navigation/stack'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ListItem from '~/components/ListItem'
import { unhideAsset } from '~/features/assetsDisplay/hiddenAssetsActions'
import { selectHiddenAssetsIds } from '~/features/assetsDisplay/hiddenAssetsSelectors'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'

interface HiddenAssetsScreenProps extends StackScreenProps<RootStackParamList, 'HiddenAssetsScreen'>, ScreenProps {}

const HiddenAssetsScreen = ({ navigation, ...props }: HiddenAssetsScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const hiddenAssetsIds = useAppSelector((s) => selectHiddenAssetsIds(s))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s))

  const handleAddAssetPress = () => {
    dispatch(openModal({ name: 'SelectAssetToHideModal' }))
  }

  const handleAssetUnHide = (assetId: string) => {
    dispatch(unhideAsset(assetId))
    showToast({ text1: t('Asset unhidden'), type: 'success' })
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
        {hiddenAssetsIds.length === 0 ? (
          <EmptyPlaceholder style={{ flexGrow: 0 }}>
            <AppText size={28}>✨</AppText>
            <AppText>{t('No assets are hidden')}</AppText>
          </EmptyPlaceholder>
        ) : (
          <FungibleTokensList>
            {hiddenAssetsIds.map((id, i) => {
              const token = knownFungibleTokens.find((t) => t.id === id)
              return (
                token && (
                  <ListItem
                    key={id}
                    icon={<AssetLogo assetId={token.id} size={38} />}
                    title={token.name}
                    rightSideContent={
                      <Button iconProps={{ name: 'x' }} squared compact onPress={() => handleAssetUnHide(id)} />
                    }
                    isLast={i === hiddenAssetsIds.length - 1}
                  />
                )
              )
            })}
          </FungibleTokensList>
        )}
      </ScreenSection>
      <BottomButtons>
        <Button
          title={t('Add an asset to hide')}
          type="primary"
          onPress={handleAddAssetPress}
          iconProps={{ name: 'eye-off' }}
        />
      </BottomButtons>
    </ScrollScreen>
  )
}

export default HiddenAssetsScreen

const FungibleTokensList = styled.View`
  gap: ${VERTICAL_GAP / 2}px;
`
