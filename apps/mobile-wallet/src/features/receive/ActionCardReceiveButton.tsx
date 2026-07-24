import { AnalyticsEvent } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import useGoToReceive from '~/features/receive/useGoToReceive'

interface ActionCardReceiveButtonProps {
  origin: 'dashboard' | 'address_details' | 'token_details'
  addressHash?: AddressHash
  onPress?: () => void
}

const ActionCardReceiveButton = ({ origin, addressHash, onPress }: ActionCardReceiveButtonProps) => {
  const goToReceive = useGoToReceive()
  const { t } = useTranslation()

  const handleReceivePress = () => {
    sendAnalytics({ event: AnalyticsEvent.ACTION_CARD_PRESSED_BTN_TO_RECEIVE_FUNDS_TO, props: { origin } })
    goToReceive(addressHash)
    onPress?.()
  }

  return <ActionCardButton title={t('Receive')} onPress={handleReceivePress} iconProps={{ name: 'arrow-down' }} />
}

export default ActionCardReceiveButton
