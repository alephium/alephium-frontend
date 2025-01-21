import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RoundedCard from '~/components/RoundedCard'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import { closeModal, openModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import ActionCardSendButton from '~/features/send/ActionCardSendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokens, selectAddressByHash } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressDetailsModalHeaderProps {
  addressHash: string
  parentModalId: ModalInstance['id']
}

const AddressDetailsModalHeader = ({ addressHash, parentModalId }: AddressDetailsModalHeaderProps) => {
  const { t } = useTranslation()
  const selectAddressTokens = useMemo(makeSelectAddressesTokens, [])
  const hasTokens = useAppSelector((s) => selectAddressTokens(s, addressHash)).length > 0
  const dispatch = useAppDispatch()

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash, parentModalId } }))
  }

  const handleClose = () => dispatch(closeModal({ id: parentModalId }))

  return (
    <AddressDetailsModalHeaderStyled>
      <RoundedCard>
        <AddressAnimatedBackground addressHash={addressHash} />
        <BalanceSummary addressHash={addressHash} />
      </RoundedCard>

      <ActionButtons>
        {hasTokens && <ActionCardSendButton origin="addressDetails" addressHash={addressHash} onPress={handleClose} />}
        <ActionCardReceiveButton origin="addressDetails" addressHash={addressHash} />
        <ActionCardBuyButton origin="addressDetails" receiveAddressHash={addressHash} />
        <ActionCardButton title={t('Settings')} onPress={handleSettingsPress} iconProps={{ name: 'settings' }} />
      </ActionButtons>
    </AddressDetailsModalHeaderStyled>
  )
}

export default AddressDetailsModalHeader

const AddressAnimatedBackground = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.settings.color} isAnimated />
}

const AddressDetailsModalHeaderStyled = styled.View`
  padding: ${VERTICAL_GAP / 2}px 0 ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  gap: 10px;
`
