import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Select, { SelectOption } from '@/components/Inputs/Select'
import useAnalytics from '@/features/analytics/useAnalytics'
import { addressOrderPreferenceChanged } from '@/features/settings/settingsActions'
import { AddressOrder } from '@/features/settings/settingsConstants'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const AddressSortingSelect = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const orderPreference = useAppSelector((s) => s.settings.addressOrderPreference)

  const orderOptions: SelectOption<AddressOrder>[] = [
    { value: AddressOrder.LastUse, label: t('Last used') },
    { value: AddressOrder.AlphBalance, label: t('ALPH balance') },
    { value: AddressOrder.Label, label: t('Address label') }
  ]

  const onSelect = (value: AddressOrder) => {
    dispatch(addressOrderPreferenceChanged(value))
    sendAnalytics({ event: 'Address order changed', props: { value } })
  }

  return (
    <AddressSortingSelectStyled>
      <Select
        title={t('Sort by')}
        label={t('Sort by')}
        id="address-order"
        onSelect={onSelect}
        options={orderOptions}
        controlledValue={orderOptions.find(({ value }) => value === orderPreference)}
        noMargin
        heightSize="normal"
      />
    </AddressSortingSelectStyled>
  )
}

export default AddressSortingSelect

const AddressSortingSelectStyled = styled.div`
  min-width: 180px;
`
