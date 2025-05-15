import { useFetchWalletFtsSorted } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'

import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import useHideToken from '~/features/assetsDisplay/hideTokens/useHideToken'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'

const SelectTokenToHideModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const { data: knownFungibleTokens } = useFetchWalletFtsSorted()
  const handleTokenSelection = useHideToken('app_settings', id)

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
              onPress={() => handleTokenSelection(id)}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default SelectTokenToHideModal
