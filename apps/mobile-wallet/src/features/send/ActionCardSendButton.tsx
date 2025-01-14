import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface ActionCardSendButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails'
  addressHash?: AddressHash
  onPress?: () => void
}

const ActionCardSendButton = ({ origin, addressHash, onPress }: ActionCardSendButtonProps) => {
  const navigation = useNavigation<NavigationProp<SendNavigationParamList | RootStackParamList>>()
  const { t } = useTranslation()

  const handleSendPress = () => {
    sendAnalytics({ event: 'Action card: Pressed btn to send funds from', props: { origin } })

    navigation.navigate(
      'SendNavigation',
      addressHash ? { screen: 'DestinationScreen', params: { fromAddressHash: addressHash } } : undefined
    )

    onPress?.()
  }

  return <ActionCardButton title={t('Send')} onPress={handleSendPress} iconProps={{ name: 'send' }} />
}

export default ActionCardSendButton
