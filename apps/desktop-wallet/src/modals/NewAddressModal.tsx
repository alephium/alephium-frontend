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
import { NonSensitiveAddressData } from '@alephium/keyring'
import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { Info } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressMetadataForm from '@/components/AddressMetadataForm'
import InfoBox from '@/components/InfoBox'
import Select from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import ToggleSection from '@/components/ToggleSection'
import { useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { getName } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

interface NewAddressModalProps {
  title: string
  onClose: () => void
  singleAddress?: boolean
}

const NewAddressModal = ({ title, onClose, singleAddress }: NewAddressModalProps) => {
  const { t } = useTranslation()
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { generateAddress, generateAndSaveOneAddressPerGroup } = useAddressGeneration()
  const posthog = usePostHog()

  const [addressLabel, setAddressLabel] = useState({ title: '', color: isPassphraseUsed ? '' : getRandomLabelColor() })
  const [isDefaultAddress, setIsDefaultAddress] = useState(false)
  const [newAddressData, setNewAddressData] = useState<NonSensitiveAddressData>()
  const [newAddressGroup, setNewAddressGroup] = useState<number>()

  useEffect(() => {
    if (singleAddress) {
      try {
        const address = generateAddress()
        setNewAddressData(address)
        setNewAddressGroup(addressToGroup(address.hash, TOTAL_NUMBER_OF_GROUPS))
      } catch (e) {
        console.error(e)
      }
    }
    // Without disabling eslint, we need to add `generateAddress` in the deps. Doing so results in infinite renders,
    // even after wrapping it in a useCallback. The only solution would be to implement generateAddress in this
    // component and wrap it in useCallback. Which might not be a bad idea since it's not used anywhere else. But then
    // we don't have a unique place for all address generation function. Which is also fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleAddress])

  const onGenerateClick = () => {
    if (singleAddress && newAddressData) {
      const settings = {
        isDefault: isDefaultAddress,
        color: addressLabel.color,
        label: addressLabel.title
      }

      try {
        saveNewAddresses([{ ...newAddressData, ...settings }])

        posthog.capture('New address created', { label_length: settings.label.length })
      } catch (e) {
        console.error(e)
      }
    } else {
      generateAndSaveOneAddressPerGroup({ labelPrefix: addressLabel.title, labelColor: addressLabel.color })

      posthog.capture('One address per group generated', { label_length: addressLabel.title.length })
    }
    onClose()
  }

  let defaultAddressMessage = t('Default address for sending transactions.') as string

  if (defaultAddress) {
    defaultAddressMessage +=
      defaultAddress.index !== newAddressData?.index
        ? ' ' +
          t('Note that if activated, "{{ address }}" will not be the default address anymore.', {
            address: getName(defaultAddress)
          })
        : ''
  }

  function onSelect(group?: number) {
    if (group === undefined) return

    try {
      const address = generateAddress({ group })
      setNewAddressData(address)
      setNewAddressGroup(group)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <CenteredModal title={title} onClose={onClose}>
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
            <InfoBox Icon={Info} contrast noBorders>
              {t('The group number will be automatically be appended to the addresses’ label.')}
            </InfoBox>
          )}
        </Section>
      )}
      {isPassphraseUsed && singleAddress && (
        <InfoBox contrast noBorders>
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
            onSelect={onSelect}
            title={t('Select group')}
            id="group"
          />
        </ToggleSection>
      )}
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={onGenerateClick}>{t('Generate')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default NewAddressModal

const generateGroupSelectOption = (groupNumber: number) => ({ value: groupNumber, label: `Group ${groupNumber}` })
