import { useFetchAddressesHashesWithBalanceSortedByLastUse } from '@alephium/shared-react'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectDefaultAddress } from '~/store/addresses/addressesSelectors'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'>, ScrollScreenProps {}

const OriginScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const { fromAddress, setFromAddress } = useSendContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { screenScrollHandler } = useHeaderContext()
  const { t } = useTranslation()

  const { data: addressesWithBalance } = useFetchAddressesHashesWithBalanceSortedByLastUse(params?.tokenId)

  useFocusEffect(
    useCallback(() => {
      if (!fromAddress && defaultAddress) setFromAddress(defaultAddress.hash)
    }, [defaultAddress, fromAddress, setFromAddress])
  )

  return (
    <AddressFlashListScreen
      data={addressesWithBalance}
      onAddressPress={setFromAddress}
      selectedAddress={fromAddress}
      headerTitleAlwaysVisible
      screenTitle={t('Origin')}
      screenIntro={t('Select the address from which to send the transaction.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Continue')}
          variant="highlight"
          onPress={() => navigation.navigate('AddressTokensScreen', { tokenId: params?.tokenId })}
        />
      )}
      tokenId={params?.tokenId}
      origin="originAddress"
    />
  )
}

export default OriginScreen
