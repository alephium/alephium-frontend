import { AddressHash } from '@alephium/shared'
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
    sendAnalytics({ event: 'Action card: Pressed btn to buy', props: { origin } })

    dispatch(openModal({ name: 'BuyModal', props: { receiveAddressHash } }))
  }

  return <ActionCardButton title={t('Buy')} onPress={handleBuyPress} iconProps={{ name: 'credit-card' }} />
}

export default ActionCardBuyButton
