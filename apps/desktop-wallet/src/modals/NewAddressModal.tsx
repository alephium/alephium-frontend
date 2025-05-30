import { selectDefaultAddress } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { Info } from 'lucide-react'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressMetadataForm from '@/components/AddressMetadataForm'
import InfoBox from '@/components/InfoBox'
import Select from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import ToggleSection from '@/components/ToggleSection'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

export interface NewAddressModalProps {
  title: string
  singleAddress?: boolean
}

const NewAddressModal = memo(({ id, title, singleAddress }: ModalBaseProp & NewAddressModalProps) => {
  const { t } = useTranslation()
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { generateAddress, generateAndSaveOneAddressPerGroup } = useAddressGeneration()
  const { sendAnalytics } = useAnalytics()
  const dispatch = useAppDispatch()

  const [addressLabel, setAddressLabel] = useState({ title: '', color: isPassphraseUsed ? '' : getRandomLabelColor() })
  const [isDefaultAddress, setIsDefaultAddress] = useState(false)
  const [newAddressGroup, setNewAddressGroup] = useState<number>()
  const [isLoading, setIsLoading] = useState(false)

  if (!defaultAddress) return null

  const onClose = () => dispatch(closeModal({ id }))

  const generateSingleAddress = async () => {
    setIsLoading(true)

    try {
      const address = await generateAddress(newAddressGroup)

      if (!address) return

      const settings = {
        isDefault: isDefaultAddress,
        color: addressLabel.color,
        label: addressLabel.title
      }

      try {
        saveNewAddresses([{ ...address, ...settings }])

        sendAnalytics({ event: 'New address created', props: { label_length: settings.label.length } })
        onClose()
      } catch (error) {
        dispatch(
          showToast({
            text: `${t('could_not_save_new_address_one')}: ${error}`,
            type: 'error',
            duration: 'long'
          })
        )
        sendAnalytics({ type: 'error', message: 'Error while saving newly generated address' })
      }
    } catch (error) {
      const message = 'Could not generate address'
      sendAnalytics({ type: 'error', message })
      dispatch(showToast({ text: `${t(message)}: ${error}`, type: 'error', duration: 'long' }))
    } finally {
      setIsLoading(false)
    }
  }

  const generateOneAddressPerGroup = async () => {
    setIsLoading(true)
    await generateAndSaveOneAddressPerGroup({ labelPrefix: addressLabel.title, labelColor: addressLabel.color })
    setIsLoading(false)
    onClose()

    sendAnalytics({ event: 'One address per group generated', props: { label_length: addressLabel.title.length } })
  }

  const defaultAddressMessage = `${t('Default address for sending transactions.')} ${t(
    'Note that if activated, "{{ address }}" will not be the default address anymore.',
    {
      address: getName(defaultAddress)
    }
  )}`

  return (
    <CenteredModal title={title} id={id} isLoading={isLoading} hasFooterButtons>
      {!isPassphraseUsed && (
        <Section align="flex-start">
          <AddressMetadataForm
            label={addressLabel}
            setLabel={setAddressLabel}
            defaultAddressMessage={defaultAddressMessage}
            isDefault={isDefaultAddress}
            setIsDefault={setIsDefaultAddress}
            isDefaultAddressToggleEnabled
            singleAddress={singleAddress}
          />
          {!singleAddress && (
            <InfoBox Icon={Info} contrast importance="accent">
              {t('The group number will be automatically be appended to the addresses’ label.')}
            </InfoBox>
          )}
        </Section>
      )}
      {isPassphraseUsed && singleAddress && (
        <InfoBox contrast>
          {t(
            'By default, the address is generated in a random group. You can select the group you want the address to be generated in using the Advanced options.'
          )}
        </InfoBox>
      )}
      {singleAddress && (
        <ToggleSection title={t('Advanced options')} subtitle={t('Select address group')}>
          <Select
            label={t('Group')}
            controlledValue={newAddressGroup !== undefined ? generateGroupSelectOption(newAddressGroup) : undefined}
            options={Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => generateGroupSelectOption(index))}
            onSelect={setNewAddressGroup}
            title={t('Select group')}
            id="group"
          />
        </ToggleSection>
      )}
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={singleAddress ? generateSingleAddress : generateOneAddressPerGroup}>
          {t('Generate')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default NewAddressModal

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })
