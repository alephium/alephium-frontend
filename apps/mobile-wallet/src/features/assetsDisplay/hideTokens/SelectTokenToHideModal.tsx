import { useFetchWalletFtsSorted } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import useHideToken from '~/features/assetsDisplay/hideTokens/useHideToken'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'

const SelectTokenToHideModal = memo<ModalBaseProp>(({ id }) => {
  const { t } = useTranslation()
  const { data: knownFungibleTokens } = useFetchWalletFtsSorted()
  const { dismissModal, onDismiss } = useModalDismiss({ id })
  const handleTokenSelection = useHideToken('app_settings', dismissModal)

  return (
    <BottomModal2
      onDismiss={onDismiss}
      modalId={id}
      title={t('Asset to hide')}
      flashListProps={{
        data: knownFungibleTokens.filter(({ id }) => id !== ALPH.id),
        estimatedItemSize: 60,
        renderItem: ({ item: { id, name } }) => (
          <ListItem
            key={id}
            title={name}
            icon={<AssetLogo assetId={id} size={32} />}
            onPress={() => handleTokenSelection(id)}
          />
        )
      }}
    />
  )
})

export default SelectTokenToHideModal
