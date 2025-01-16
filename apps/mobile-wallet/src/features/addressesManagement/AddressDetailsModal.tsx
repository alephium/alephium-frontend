import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AddressesTokensList from '~/components/AddressesTokensList'
import AnimatedBackground from '~/components/AnimatedBackground'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RoundedCard from '~/components/RoundedCard'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import ActionCardSendButton from '~/features/send/ActionCardSendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokens, selectAddressByHash } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const selectAddressTokens = useMemo(makeSelectAddressesTokens, [])
  const hasTokens = useAppSelector((s) => selectAddressTokens(s, addressHash)).length > 0

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash, parentModalId: id } }))
  }

  const handleClose = () => dispatch(closeModal({ id }))

  return (
    <BottomModal modalId={id} title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <Content>
        <RoundedCard>
          <AddressAnimatedBackground addressHash={addressHash} />
          <BalanceSummary addressHash={addressHash} />
        </RoundedCard>

        <ActionButtons>
          {hasTokens && (
            <ActionCardSendButton origin="addressDetails" addressHash={addressHash} onPress={handleClose} />
          )}
          <ActionCardReceiveButton origin="addressDetails" addressHash={addressHash} />
          <ActionCardBuyButton origin="addressDetails" receiveAddressHash={addressHash} />
          <ActionCardButton title={t('Settings')} onPress={handleSettingsPress} iconProps={{ name: 'settings' }} />
        </ActionButtons>
      </Content>
      <AddressesTokensList addressHash={addressHash} parentModalId={id} />
    </BottomModal>
  )
})

export default AddressDetailsModal

const AddressAnimatedBackground = ({ addressHash }: AddressDetailsModalProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.settings.color} isAnimated />
}

const Content = styled.View`
  padding: ${VERTICAL_GAP / 2}px 0 ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  gap: 10px;
`
