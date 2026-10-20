import { AddressMigrationOrigin } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { useIsWalletWatchOnly } from '~/features/watchOnlyWallet/useIsWalletWatchOnly'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface AddressMigrationButtonProps {
  addressHash: AddressHash
  origin: AddressMigrationOrigin
}

const AddressMigrationButton = ({ addressHash, origin }: AddressMigrationButtonProps) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const isWatchOnly = useIsWalletWatchOnly()

  if (isWatchOnly) return null

  return (
    <Button
      title={t('Get the new address type')}
      onPress={() => navigation.navigate('AddressMigrationScreen', { fromAddressHash: addressHash, origin })}
      variant="accent"
      short
    />
  )
}

export default AddressMigrationButton
