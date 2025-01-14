import { AddressHash } from '@alephium/shared'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AddressesTokensList from '~/components/AddressesTokensList'
import AnimatedBackground from '~/components/AnimatedBackground'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RoundedCard from '~/components/RoundedCard'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import ActionCardSendButton from '~/features/send/ActionCardSendButton'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { addressSettingsSaved, makeSelectAddressesTokens, selectAddressByHash } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

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
          <ActionCardButton title={t('Settings')} onPress={handleSettingsPress} iconProps={{ name: 'settings' }} />
          <SetDefaultAddressCardButton addressHash={addressHash} />
        </ActionButtons>
      </Content>
      <AddressesTokensList addressHash={addressHash} parentModalId={id} />
    </BottomModal>
  )
})

export default AddressDetailsModal

const SetDefaultAddressCardButton = ({ addressHash }: AddressDetailsModalProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const persistAddressSettings = usePersistAddressSettings()

  const [defaultAddressIsChanging, setDefaultAddressIsChanging] = useState(false)

  if (!address) return

  const handleDefaultPress = async () => {
    if (!address || address.settings.isDefault) return

    setDefaultAddressIsChanging(true)

    try {
      const newSettings = { ...address.settings, isDefault: true }

      await persistAddressSettings({ ...address, settings: newSettings })
      dispatch(addressSettingsSaved({ ...address, settings: newSettings }))

      showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })

      sendAnalytics({ event: 'Address: Used address card default toggle' })
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not use address card default toggle' })
    } finally {
      setDefaultAddressIsChanging(false)
    }
  }

  return (
    <ActionCardButton
      title={t('Default')}
      onPress={handleDefaultPress}
      iconProps={{ name: 'star' }}
      loading={defaultAddressIsChanging}
      color={address?.settings.isDefault ? address.settings.color : undefined}
    />
  )
}

const AddressAnimatedBackground = ({ addressHash }: AddressDetailsModalProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.settings.color} isAnimated />
}

const Content = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP}px;
  flex-direction: row;
  gap: 10px;
`
