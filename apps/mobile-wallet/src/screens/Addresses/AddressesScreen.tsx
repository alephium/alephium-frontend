import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import FlashListScreen from '~/components/layout/FlashListScreen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const AddressesScreen = ({ onScroll }: TabBarPageScreenProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const bottomBarHeight = useBottomTabBarHeight()

  const { data: addresses } = useFetchAddressesHashesSortedByLastUse()

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <FlashListScreen
      data={addresses}
      refreshControl={<RefreshSpinner progressViewOffset={150} />}
      contentPaddingTop={165}
      onScroll={onScroll}
      contentContainerStyle={{ paddingHorizontal: DEFAULT_MARGIN, paddingBottom: bottomBarHeight }}
      renderItem={({ item: addressHash, index }) => (
        <AddressBox
          key={addressHash}
          addressHash={addressHash}
          isLast={index === addresses.length - 1}
          onPress={() => handleAddressPress(addressHash)}
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
