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
import { ALPH } from '@alephium/token-list'
import { Trash2 } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import AddressMetadataForm from '@/components/AddressMetadataForm'
import Amount from '@/components/Amount'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { addressDeleted } from '@/storage/addresses/addressesActions'
import { selectAddressByHash, selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { saveAddressSettings } from '@/storage/addresses/addressesStorageUtils'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
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
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const dispatch = useAppDispatch()

  const { data: addressAlphBalances } = useFetchAddressBalancesAlph({ addressHash })

  const [addressLabel, setAddressLabel] = useState({
    title: address?.label ?? '',
    color: address?.color || getRandomLabelColor()
  })
  const [isDefaultAddress, setIsDefaultAddress] = useState(address?.isDefault ?? false)

  if (!address || !defaultAddress || !activeWalletId) return null

  const availableBalance = addressAlphBalances?.availableBalance
  const isDefaultAddressToggleEnabled = defaultAddress.hash !== address.hash
  const isSweepButtonEnabled = addresses.length > 1 && availableBalance !== undefined && availableBalance > 0

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

  const openSweepModal = () =>
    dispatch(
      openModal({
        name: 'AddressSweepModal',
        props: { addressHash, onSuccessfulSweep: onClose }
      })
    )

  const handleDeletePress = () => {
    const onDeleteConfirm = () => {
      try {
        addressMetadataStorage.deleteOne(activeWalletId, address.index)
        dispatch(addressDeleted(address.hash))
      } catch (error) {
        console.error(error)
      }
    }

    dispatch(
      openModal({
        name: 'ConfirmModal',
        props: {
          Icon: Trash2,
          onConfirm: onDeleteConfirm,
          narrow: true,
          text: t('Are you sure you want to remove "{{ address }}" from your address list?', {
            address: getName(address)
          })
        }
      })
    )
  }

  let defaultAddressMessage = `${t('Default address for sending transactions.')} `
  defaultAddressMessage += isDefaultAddressToggleEnabled
    ? t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
        address: getName(defaultAddress)
      })
    : t('To remove this address from being the default address, you must set another one as default first.')

  return (
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
            <Button short wide onClick={openSweepModal} disabled={!isSweepButtonEnabled}>
              {t('Sweep')}
            </Button>

            {availableBalance !== undefined && (
              <AvailableAmount tabIndex={0}>
                {t('Available')}: <Amount tokenId={ALPH.id} value={availableBalance} color={theme.font.secondary} />
              </AvailableAmount>
            )}
          </SweepButton>
        }
      />
      <HorizontalDivider narrow />
      <ModalFooterButtons>
        {address.isDefault ? (
          <div
            data-tooltip-id="default"
            data-tooltip-content={t('To delete this address set another one as the default one first.')}
            style={{ width: '100%' }}
          >
            <ModalFooterButton role="secondary" variant="alert" disabled={true}>
              {t('Delete')}
            </ModalFooterButton>
          </div>
        ) : (
          <ModalFooterButton role="secondary" variant="alert" onClick={handleDeletePress} disabled={address.isDefault}>
            {t('Delete')}
          </ModalFooterButton>
        )}
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={onSaveClick}>{t('Save')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default AddressOptionsModal

const SweepButton = styled.div``

const AvailableAmount = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
  text-align: right;
`
