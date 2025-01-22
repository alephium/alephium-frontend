import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import CameraScanButtonBase from '~/features/qrCodeScan/CameraScanButtonBase'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { showToast } from '~/utils/layout'

interface NewContactCameraScanButtonProps {
  onNewContactHashDetected: (addressHash: AddressHash) => void
}

const NewContactCameraScanButton = ({ onNewContactHashDetected }: NewContactCameraScanButtonProps) => {
  const contacts = useAppSelector(selectAllContacts)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  const handleValidAddressScanned = async (text: string) => {
    const existingContact = contacts.find((c) => c.address === text)

    if (existingContact) {
      navigation.navigate('ContactScreen', { contactId: existingContact.id })

      showToast({
        text1: t('You already have a contact with this address'),
        type: 'info'
      })
      sendAnalytics({ event: 'Contact: Tried to add an existing contact by scanning QR code' })
    } else {
      onNewContactHashDetected(text)
      sendAnalytics({ event: 'Contact: Captured new contact address by scanning QR code' })
    }
  }

  return (
    <CameraScanButtonBase
      text={t('Scan an Alephium address QR code to add to your contacts list.')}
      origin="contact"
      onValidAddressScanned={handleValidAddressScanned}
      compact
    />
  )
}

export default NewContactCameraScanButton
