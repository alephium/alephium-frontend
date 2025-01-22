import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import { openModal } from '~/features/modals/modalActions'
import useWalletSingleAddress from '~/hooks/addresses/useWalletSingleAddress'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ActionCardReceiveButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails'
  addressHash?: AddressHash
  onPress?: () => void
}

const ActionCardReceiveButton = ({ origin, addressHash, onPress }: ActionCardReceiveButtonProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const walletSingleAddressHash = useWalletSingleAddress()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const receiveAddressHash = addressHash || walletSingleAddressHash

  const handleReceivePress = () => {
    sendAnalytics({ event: 'Action card: Pressed btn to receive funds to', props: { origin } })

    if (receiveAddressHash) {
      dispatch(openModal({ name: 'ReceiveQRCodeModal', props: { addressHash: receiveAddressHash } }))
    } else {
      navigation.navigate('ReceiveNavigation')
    }

    onPress?.()
  }

  return <ActionCardButton title={t('Receive')} onPress={handleReceivePress} iconProps={{ name: 'download' }} />
}

export default ActionCardReceiveButton
