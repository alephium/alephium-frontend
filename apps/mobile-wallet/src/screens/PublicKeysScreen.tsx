import { AddressHash } from '@alephium/shared'
import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import * as Clipboard from 'expo-clipboard'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import FlashListScreen from '~/components/layout/FlashListScreen'
import Row from '~/components/Row'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast, ToastDuration } from '~/utils/layout'

interface PublicKeysScreenProps extends StackScreenProps<RootStackParamList, 'PublicKeysScreen'> {}

const PublicKeysScreen = ({ navigation, ...props }: PublicKeysScreenProps) => {
  const addresses = useUnsortedAddressesHashes()
  const { t } = useTranslation()

  const handleAddressPress = async (addressHash: AddressHash) => {
    try {
      const publicKey = await getAddressAsymetricKey(addressHash, 'public')
      await Clipboard.setStringAsync(publicKey)

      showToast({ text1: t('Public key copied!'), visibilityTime: ToastDuration.SHORT })
      sendAnalytics({ event: 'Copied public key' })
    } catch (error) {
      const message = 'Could not copy public key'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', message })
    }
  }

  return (
    <FlashListScreen
      headerOptions={{ headerTitle: t('Public keys'), type: 'stack' }}
      screenTitle={t('Public keys')}
      screenIntro={t('Tap on an address to copy its public key to the clipboard.')}
      data={addresses}
      contentPaddingTop
      renderItem={({ item: addressHash }) => (
        <Row
          key={addressHash}
          onPress={() => handleAddressPress(addressHash)}
          style={{ marginHorizontal: DEFAULT_MARGIN }}
        >
          <AddressBadge addressHash={addressHash} canCopy={false} />
        </Row>
      )}
      {...props}
    />
  )
}

export default PublicKeysScreen
