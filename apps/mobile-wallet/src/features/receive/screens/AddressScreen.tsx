import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppSelector } from '~/hooks/redux'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'AddressScreen'>, ScrollScreenProps {}

const AddressScreen = ({ navigation }: ScreenProps) => {
  const { screenScrollHandler } = useHeaderContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [addressHash, setAddressHash] = useState(defaultAddress.hash)
  const { t } = useTranslation()

  return (
    <AddressFlashListScreen
      onAddressPress={(hash) => setAddressHash(hash)}
      selectedAddress={addressHash}
      screenTitle={t('To address')}
      screenIntro={t('Select the address which you want to receive funds to.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Continue')}
          variant="highlight"
          disabled={!addressHash}
          onPress={() => navigation.navigate('QRCodeScreen', { addressHash })}
        />
      )}
    />
  )
}

export default AddressScreen
