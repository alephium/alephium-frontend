import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'>, ScrollScreenProps {}

const OriginScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const { fromAddress, setFromAddress, setToAddress } = useSendContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { screenScrollHandler } = useHeaderContext()
  const { t } = useTranslation()

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  useFocusEffect(
    useCallback(() => {
      if (!fromAddress && defaultAddress) setFromAddress(defaultAddress.hash)
    }, [defaultAddress, fromAddress, setFromAddress])
  )

  return (
    <AddressFlashListScreen
      onAddressPress={setFromAddress}
      selectedAddress={fromAddress}
      headerTitleAlwaysVisible
      screenTitle={t('Origin')}
      screenIntro={t('Select the address from which to send the transaction.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      hideEmptyAddresses
      bottomButtonsRender={() => (
        <Button title={t('Continue')} variant="highlight" onPress={() => navigation.navigate('AssetsScreen')} />
      )}
    />
  )
}

export default OriginScreen
