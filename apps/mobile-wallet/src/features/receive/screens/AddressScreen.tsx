import { selectDefaultAddressHash } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppSelector } from '~/hooks/redux'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'AddressScreen'>, ScrollScreenProps {}

const AddressScreen = ({ navigation }: ScreenProps) => {
  const { screenScrollHandler } = useHeaderContext()
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const [addressHash, setAddressHash] = useState(defaultAddressHash)
  const { t } = useTranslation()

  const { data: sortedAddressesHashes } = useFetchAddressesHashesSortedByLastUse()

  return (
    <AddressFlashListScreen
      data={sortedAddressesHashes}
      onAddressPress={setAddressHash}
      selectedAddress={addressHash}
      screenTitle={t('To address')}
      screenIntro={t('Select the address which you want to receive funds to.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      origin="destinationAddress"
      bottomButtonsRender={() =>
        addressHash && (
          <Button
            title={t('Continue')}
            variant="highlight"
            disabled={!addressHash}
            onPress={() => navigation.navigate('QRCodeScreen', { addressHash })}
          />
        )
      }
    />
  )
}

export default AddressScreen
