import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect, useMemo, useState } from 'react'
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
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { addressSettingsSaved, makeSelectAddressesTokens, selectAddressByHash } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<SendNavigationParamList | RootStackParamList>>()
  const [defaultAddressIsChanging, setDefaultAddressIsChanging] = useState(false)
  const persistAddressSettings = usePersistAddressSettings()
  const dispatch = useAppDispatch()

  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const selectAddressTokens = useMemo(makeSelectAddressesTokens, [])
  const addressTokens = useAppSelector((s) => selectAddressTokens(s, addressHash))

  useEffect(() => {
    if (!address) {
      dispatch(closeModal({ id }))
    }
  }, [address, dispatch, id])

  const handleSendPress = () => {
    sendAnalytics({ event: 'Address modal: Pressed btn to send funds from' })

    navigation.navigate('SendNavigation', {
      screen: 'DestinationScreen',
      params: { fromAddressHash: addressHash }
    })

    dispatch(closeModal({ id }))
  }

  const handleReceivePress = () => {
    sendAnalytics({ event: 'Address modal: Pressed btn to receive funds to' })

    dispatch(openModal({ name: 'ReceiveQRCodeModal', props: { addressHash } }))
  }

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash } }))
  }

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
    <BottomModal modalId={id} title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <Content>
        <RoundedCard>
          <AnimatedBackground shade={address?.settings.color} isAnimated />
          <BalanceSummary addressHash={addressHash} />
        </RoundedCard>

        <ActionButtons>
          {addressTokens.length > 0 && (
            <ActionCardButton title={t('Send')} onPress={handleSendPress} iconProps={{ name: 'send' }} />
          )}
          <ActionCardButton title={t('Receive')} onPress={handleReceivePress} iconProps={{ name: 'download' }} />
          <ActionCardButton title={t('Settings')} onPress={handleSettingsPress} iconProps={{ name: 'settings' }} />
          <ActionCardButton
            title={t('Default')}
            onPress={handleDefaultPress}
            iconProps={{ name: 'star' }}
            loading={defaultAddressIsChanging}
            color={address?.settings.isDefault ? address.settings.color : undefined}
          />
        </ActionButtons>
      </Content>
      <AddressesTokensList addressHash={addressHash} />
    </BottomModal>
  )
})

export default AddressDetailsModal

const Content = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP}px;
  flex-direction: row;
  gap: 10px;
`
