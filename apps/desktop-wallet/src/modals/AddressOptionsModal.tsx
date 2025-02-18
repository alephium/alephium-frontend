import { ALPH } from '@alephium/token-list'
import { Sparkles } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import AddressMetadataForm from '@/components/AddressMetadataForm'
import Amount from '@/components/Amount'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Truncate from '@/components/Truncate'
import ForgetAddressSection from '@/features/addressDeletion/ForgetAddressSection'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAddressByHash, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { saveAddressSettings } from '@/storage/addresses/addressesStorageUtils'
import { getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

const AddressOptionsModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { sendAnalytics } = useAnalytics()
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const addresses = useUnsortedAddresses()
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
  const isSweepButtonEnabled = addresses.length > 1 && availableBalance !== undefined && availableBalance !== '0'

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

  let defaultAddressMessage = `${t('Default address for sending transactions.')} `
  defaultAddressMessage += isDefaultAddressToggleEnabled
    ? t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
        address: getName(defaultAddress)
      })
    : t('To remove this address from being the default address, you must set another one as default first.')

  return (
    <CenteredModal
      title={t('Address options')}
      subtitle={
        <Truncate style={{ maxWidth: 100 }}>
          <HashEllipsed hash={address.hash} />
        </Truncate>
      }
      id={id}
      hasFooterButtons
      dynamicContent
    >
      {!isPassphraseUsed && (
        <AddressMetadataForm
          label={addressLabel}
          setLabel={setAddressLabel}
          defaultAddressMessage={defaultAddressMessage}
          isDefault={isDefaultAddress}
          setIsDefault={setIsDefaultAddress}
          isDefaultAddressToggleEnabled={isDefaultAddressToggleEnabled}
          singleAddress
        />
      )}

      <KeyValueInput
        label={t('Sweep address')}
        description={t('Sweep all the unlocked funds of this address to another address.')}
        noHorizontalPadding
        InputComponent={
          <SweepButton>
            <Button
              short
              wide
              onClick={openSweepModal}
              disabled={!isSweepButtonEnabled}
              style={{ minWidth: 120 }}
              Icon={Sparkles}
            >
              {t('Sweep')}
            </Button>

            {availableBalance !== undefined && (
              <AvailableAmount tabIndex={0}>
                {t('Available')}:{' '}
                <Amount tokenId={ALPH.id} value={BigInt(availableBalance)} color={theme.font.secondary} />
              </AvailableAmount>
            )}
          </SweepButton>
        }
      />

      {address.index !== 0 && <ForgetAddressSection addressHash={addressHash} addressName={getName(address)} />}

      <ModalFooterButtons>
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
