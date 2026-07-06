import { AnalyticsEvent } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

interface ActionCardBuyButtonProps {
  origin: 'dashboard' | 'addressDetails' | 'tokenDetails'
  receiveAddressHash: AddressHash
}

const ActionCardBuyButton = ({ receiveAddressHash, origin }: ActionCardBuyButtonProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleBuyPress = () => {
    sendAnalytics({ event: AnalyticsEvent.ACTION_CARD_PRESSED_BTN_TO_BUY, props: { origin } })

    dispatch(openModal({ name: 'BuyModal', props: { receiveAddressHash } }))
  }

  return <ActionCardButton title={t('Buy')} onPress={handleBuyPress} iconProps={{ name: 'card-outline' }} />
}

export default ActionCardBuyButton
