import { AddressHash, addressSettingsSaved, selectDefaultAddressHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { showToast, ToastDuration } from '~/utils/layout'

const DefaultAddressSection = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const theme = useTheme()

  if (!defaultAddressHash) return null

  const handleSetDefaultAddress = (addressHash: AddressHash) => {
    if (addressHash === defaultAddressHash) return

    dispatch(addressSettingsSaved({ addressHash, settings: { isDefault: true } }))
    showToast({ text1: 'This is now the default address', visibilityTime: ToastDuration.SHORT })
    sendAnalytics({ event: 'Set address as default', props: { origin: 'staking' } })
  }

  const openDefaultAddressModal = () =>
    dispatch(openModal({ name: 'SelectAddressModal', props: { onAddressPress: handleSetDefaultAddress } }))

  return (
    <DefaultAddressSectionStyled>
      <AppText color="tertiary" size={13}>
        {t('Default address')}
      </AppText>
      <AddressBox
        addressHash={defaultAddressHash}
        hideAssets
        noBottomMargin
        showTokenAmount
        tokenId={ALPH.id}
        origin="selectAddressModal"
        rounded
        style={{ borderWidth: 1, borderColor: theme.border.primary }}
        onPress={openDefaultAddressModal}
      />
    </DefaultAddressSectionStyled>
  )
}

export default DefaultAddressSection

const DefaultAddressSectionStyled = styled.View`
  gap: 8px;
`
