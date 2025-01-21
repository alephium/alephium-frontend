import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import { hideAsset } from '~/features/assetsDisplay/hideAssets/hiddenAssetsActions'
import { selectHiddenAssetsIds } from '~/features/assetsDisplay/hideAssets/hiddenAssetsSelectors'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { showToast } from '~/utils/layout'

const SelectAssetToHideModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const hiddenAssetsIds = useAppSelector(selectHiddenAssetsIds)
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector(selectAddressesKnownFungibleTokens)

  const handleAssetSelection = (assetId: string) => {
    dispatch(hideAsset(assetId))
    showToast({ text1: t('Asset hidden'), type: 'info' })
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('Asset to hide')}
      flashListRender={(props) => (
        <FlashList
          data={knownFungibleTokens.filter((t) => !hiddenAssetsIds.includes(t.id))}
          estimatedItemSize={70}
          renderItem={({ item, index }) => (
            <ListItem
              key={item.id}
              title={item.name}
              icon={<AssetLogo assetId={item.id} size={38} />}
              onPress={() => handleAssetSelection(item.id)}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default SelectAssetToHideModal
