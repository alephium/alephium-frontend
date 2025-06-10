import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { closeAllModals } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface SendButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails' | 'qrCodeScan' | 'contact'
  buttonType?: 'action-card' | 'quick-action'
  originAddressHash?: AddressHash
  destinationAddressHash?: AddressHash
  tokenId?: Token['id']
  onPress?: () => void
  isNft?: boolean
}

const SendButton = ({
  origin,
  originAddressHash,
  destinationAddressHash,
  tokenId,
  onPress,
  isNft,
  buttonType = 'action-card'
}: SendButtonProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleSendPress = () => {
    sendAnalytics({ event: 'Send button pressed', props: { origin } })

    navigation.navigate('SendNavigation', { originAddressHash, destinationAddressHash, tokenId, isNft })
    dispatch(closeAllModals())

    onPress?.()
  }

  const ButtonComponent = buttonType === 'action-card' ? ActionCardButton : QuickActionButton

  return <ButtonComponent title={t('Send')} onPress={handleSendPress} iconProps={{ name: 'arrow-up' }} />
}

export default SendButton
