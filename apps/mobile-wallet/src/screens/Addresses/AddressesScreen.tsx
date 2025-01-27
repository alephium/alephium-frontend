import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'

const AddressesScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const addresses = useAppSelector(selectAllAddresses)

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <BottomBarScrollScreen
      refreshControl={<RefreshSpinner progressViewOffset={190} />}
      hasBottomBar
      contentPaddingTop={115}
      {...props}
    >
      <Content>
        {addresses.map((address, i) => (
          <AddressBox
            key={address.hash}
            addressHash={address.hash}
            isLast={i === addresses.length - 1}
            onPress={() => handleAddressPress(address.hash)}
            origin="addressesScreen"
          />
        ))}
        {addresses.length === 1 && (
          <EmptyPlaceholder>
            <AppText style={{ textAlign: 'center' }} color="secondary" semiBold>
              {t('Did you know?')}
            </AppText>
            <AppText style={{ textAlign: 'center' }} color="tertiary">
              {t('Splitting your funds into multiple addresses can help you stay organized and increase privacy.')}
            </AppText>
          </EmptyPlaceholder>
        )}
      </Content>
    </BottomBarScrollScreen>
  )
}

export default AddressesScreen

const Content = styled(ScreenSection)`
  margin-top: ${VERTICAL_GAP * 2}px;
`
