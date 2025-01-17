import { AddressHash } from '@alephium/shared'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
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

  const addresses = useAppSelector(selectAllAddresses)

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <BottomBarScrollScreen
      refreshControl={<RefreshSpinner progressViewOffset={190} />}
      hasBottomBar
      contentPaddingTop={120}
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
      </Content>
    </BottomBarScrollScreen>
  )
}

export default AddressesScreen

const Content = styled(ScreenSection)`
  margin-top: ${VERTICAL_GAP * 2}px;
`
