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
import { selectAddressIds, selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

const AddressesScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <BottomBarScrollScreen
      refreshControl={<RefreshSpinner progressViewOffset={190} />}
      hasBottomBar
      contentPaddingTop
      {...props}
    >
      <Content>
        {addresses.map((address, i) => (
          <AddressBox
            key={address.hash}
            addressHash={address.hash}
            isLast={i === addresses.length - 1}
            onPress={() => handleAddressPress(address.hash)}
          />
        ))}
        {addressHashes.length === 1 && (
          <EmptyPlaceholder>
            <AppText size={28}>💌</AppText>
            <AppText color="secondary">{t('Create addresses to better organize your assets.')}</AppText>
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
