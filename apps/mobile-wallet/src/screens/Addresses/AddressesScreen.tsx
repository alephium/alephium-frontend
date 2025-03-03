import { AddressHash } from '@alephium/shared'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const AddressesScreen = ({ onScroll }: TabBarPageScreenProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const bottomBarHeight = useBottomTabBarHeight()

  const addresses = useAppSelector(selectAllAddresses)

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <FlashListScreen
      data={addresses}
      refreshControl={<RefreshSpinner progressViewOffset={190} />}
      contentPaddingTop={165}
      estimatedItemSize={78}
      onScroll={onScroll}
      contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN, paddingBottom: bottomBarHeight }}
      renderItem={({ item, index }) => (
        <AddressBox
          key={item.hash}
          addressHash={item.hash}
          isLast={index === addresses.length - 1}
          onPress={() => handleAddressPress(item.hash)}
          origin="addressesScreen"
        />
      )}
      ListFooterComponent={() =>
        addresses.length === 1 && (
          <EmptyPlaceholder>
            <AppText style={{ textAlign: 'center' }} color="secondary" semiBold>
              {t('Did you know?')}
            </AppText>
            <AppText style={{ textAlign: 'center' }} color="tertiary">
              {t('Splitting your funds into multiple addresses can help you stay organized and increase privacy.')}
            </AppText>
          </EmptyPlaceholder>
        )
      }
    />
  )
}

export default AddressesScreen
