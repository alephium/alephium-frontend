import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface ActionCardReceiveButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails'
  addressHash?: AddressHash
  onPress?: () => void
}

const ActionCardReceiveButton = ({ origin, addressHash, onPress }: ActionCardReceiveButtonProps) => {
  const navigation = useNavigation<NavigationProp<SendNavigationParamList | RootStackParamList>>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleReceivePress = () => {
    sendAnalytics({ event: 'Action card: Pressed btn to receive funds to', props: { origin } })

    if (addressHash) {
      dispatch(openModal({ name: 'ReceiveQRCodeModal', props: { addressHash } }))
    } else {
      navigation.navigate('ReceiveNavigation')
    }

    onPress?.()
  }

  return <ActionCardButton title={t('Receive')} onPress={handleReceivePress} iconProps={{ name: 'download' }} />
}

export default ActionCardReceiveButton
