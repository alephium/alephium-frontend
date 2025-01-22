import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ActionCardSendButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails' | 'qrCodeScan' | 'contact'
  buttonType?: 'action-card' | 'quick-action'
  originAddressHash?: AddressHash
  destinationAddressHash?: AddressHash
  tokenId?: Token['id']
  onPress?: () => void
}

const ActionCardSendButton = ({
  origin,
  originAddressHash,
  destinationAddressHash,
  tokenId,
  onPress,
  buttonType = 'action-card'
}: ActionCardSendButtonProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  const handleSendPress = () => {
    sendAnalytics({ event: 'Send button pressed', props: { origin } })

    navigation.navigate('SendNavigation', { originAddressHash, destinationAddressHash, tokenId })

    onPress?.()
  }

  const ButtonComponent = buttonType === 'action-card' ? ActionCardButton : QuickActionButton

  return <ButtonComponent title={t('Send')} onPress={handleSendPress} iconProps={{ name: 'send' }} />
}

export default ActionCardSendButton
