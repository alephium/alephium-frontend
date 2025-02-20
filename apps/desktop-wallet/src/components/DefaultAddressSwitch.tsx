import { AddressHash } from '@alephium/shared'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import Button from '@/components/Button'
import Select, { SelectOption } from '@/components/Inputs/Select'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { changeDefaultAddress } from '@/storage/addresses/addressesStorageUtils'

interface AddressOption {
  label: string
  value: AddressHash
}

const DefaultAddressSwitch = () => {
  const { t } = useTranslation()
  const addresses = useUnsortedAddresses()
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const addressOptions: AddressOption[] = addresses.map((address) => ({
    label: address.label || address.hash,
    value: address.hash
  }))

  const handleDefaultAddressChange = useCallback(
    (addressHash: string) => {
      const newDefaultAddress = addresses.find((a) => a.hash === addressHash)

      try {
        newDefaultAddress && changeDefaultAddress(newDefaultAddress)
      } catch (e) {
        console.error(e)
      }
    },
    [addresses]
  )

  return (
    <Select
      options={addressOptions}
      onSelect={handleDefaultAddressChange}
      controlledValue={addressOptions.find((n) => n.value === defaultAddress?.hash)}
      title={t('Default address')}
      optionRender={({ value }) => (
        <OptionContent>
          <AddressBadgeStyled addressHash={value} truncate />
        </OptionContent>
      )}
      id="defaultAddress"
      noMargin
      renderCustomComponent={SelectCustomComponent}
      skipEqualityCheck
    />
  )
}

export default DefaultAddressSwitch

const SelectCustomComponent = (value?: SelectOption<AddressHash>, disablePointer?: boolean) => {
  const { t } = useTranslation()

  return (
    <Button
      role="secondary"
      short
      transparent
      data-tooltip-id="default"
      data-tooltip-content={t('Default address')}
      disablePointer={disablePointer}
      squared
    >
      {value?.value && <AddressBadgeStyled addressHash={value.value} truncate />}
    </Button>
  )
}

const AddressBadgeStyled = styled(AddressBadge)`
  width: 100%;
  overflow: hidden;
`

const OptionContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-4);
  min-width: 0;
  gap: var(--spacing-3);
`
