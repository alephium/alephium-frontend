import { ALPH } from '@alephium/token-list'
import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import useHideAsset from '~/features/assetsDisplay/hideAssets/useHideAsset'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addresses/addressesSelectors'

const SelectAssetToHideModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const selectAddressesKnownFungibleTokens = useMemo(() => makeSelectAddressesKnownFungibleTokens(), [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, undefined, true))
  const handleAssetSelection = useHideAsset('app_settings', id)

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('Asset to hide')}
      flashListRender={(props) => (
        <FlashList
          data={knownFungibleTokens.filter(({ id }) => id !== ALPH.id)}
          estimatedItemSize={70}
          renderItem={({ item: { id, name } }) => (
            <ListItem
              key={id}
              title={name}
              icon={<AssetLogo assetId={id} size={32} />}
              onPress={() => handleAssetSelection(id)}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default SelectAssetToHideModal
