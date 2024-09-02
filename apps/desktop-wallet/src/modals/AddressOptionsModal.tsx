/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useAddressesAlphBalancesTotal from '@/api/apiDataHooks/useAddressesAlphBalancesTotal'
import AddressMetadataForm from '@/components/AddressMetadataForm'
import Amount from '@/components/Amount'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import AddressSweepModal from '@/modals/AddressSweepModal'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAddressByHash, selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { saveAddressSettings } from '@/storage/addresses/addressesStorageUtils'
import { getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

export interface AddressOptionsModalProps {
  addressHash: AddressHash
}

const AddressOptionsModal = memo(({ id, addressHash }: ModalBaseProp & AddressOptionsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { sendAnalytics } = useAnalytics()
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const addresses = useAppSelector(selectAllAddresses)
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()

  const [addressLabel, setAddressLabel] = useState({
    title: address?.label ?? '',
    color: address?.color || getRandomLabelColor()
  })
  const [isDefaultAddress, setIsDefaultAddress] = useState(address?.isDefault ?? false)
  const [isAddressSweepModalOpen, setIsAddressSweepModalOpen] = useState(false)

  const {
    data: { availableBalance }
  } = useAddressesAlphBalancesTotal(addressHash)

  if (!address || !defaultAddress) return null

  const isDefaultAddressToggleEnabled = defaultAddress.hash !== address.hash
  const isSweepButtonEnabled = addresses.length > 1 && availableBalance > 0

  const onClose = () => dispatch(closeModal({ id }))

  const onSaveClick = () => {
    try {
      const settings = {
        isDefault: isDefaultAddressToggleEnabled ? isDefaultAddress : address.isDefault,
        label: addressLabel.title,
        color: addressLabel.color
      }

      saveAddressSettings(address, settings)

      onClose()

      sendAnalytics({ event: 'Changed address settings', props: { label_length: settings.label.length } })
      isDefaultAddressToggleEnabled && sendAnalytics({ event: 'Changed default address' })
    } catch (e) {
      console.error(e)
    }
  }

  let defaultAddressMessage = `${t('Default address for sending transactions.')} `
  defaultAddressMessage += isDefaultAddressToggleEnabled
    ? t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
        address: getName(defaultAddress)
      })
    : t('To remove this address from being the default address, you must set another one as default first.')

  return (
    <>
      <CenteredModal title={t('Address options')} subtitle={getName(address)} id={id}>
        {!isPassphraseUsed && (
          <>
            <AddressMetadataForm
              label={addressLabel}
              setLabel={setAddressLabel}
              defaultAddressMessage={defaultAddressMessage}
              isDefault={isDefaultAddress}
              setIsDefault={setIsDefaultAddress}
              isDefaultAddressToggleEnabled={isDefaultAddressToggleEnabled}
              singleAddress
            />
            <HorizontalDivider narrow />
          </>
        )}
        <KeyValueInput
          label={t('Sweep address')}
          description={t('Sweep all the unlocked funds of this address to another address.')}
          InputComponent={
            <SweepButton>
              <Button
                short
                wide
                onClick={() => isSweepButtonEnabled && setIsAddressSweepModalOpen(true)}
                disabled={!isSweepButtonEnabled}
              >
                {t('Sweep')}
              </Button>
              <AvailableAmount tabIndex={0}>
                {t('Available')}: <Amount value={availableBalance} color={theme.font.secondary} />
              </AvailableAmount>
            </SweepButton>
          }
        />
        <HorizontalDivider narrow />
        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={onClose}>
            {t('Cancel')}
          </ModalFooterButton>
          <ModalFooterButton onClick={onSaveClick}>{t('Save')}</ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
      <ModalPortal>
        {isAddressSweepModalOpen && (
          <AddressSweepModal
            sweepAddress={address}
            onClose={() => setIsAddressSweepModalOpen(false)}
            onSuccessfulSweep={onClose}
          />
        )}
      </ModalPortal>
    </>
  )
})

export default AddressOptionsModal

const SweepButton = styled.div``

const AvailableAmount = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
  text-align: right;
`
