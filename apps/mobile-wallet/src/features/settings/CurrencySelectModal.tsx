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

import { CURRENCIES, Currency, fiatCurrencyChanged } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const currencyOptions = Object.values(CURRENCIES).map((currency) => ({
  label: `${currency.name} (${currency.ticker})`,
  value: currency.ticker
}))

const CurrencySelectModal = withModal(({ id }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const currentCurrency = useAppSelector((s) => s.settings.currency)

  const handleCurrencyChange = (currency: Currency) => {
    dispatch(fiatCurrencyChanged(currency))
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Currency')}>
      <Surface>
        {currencyOptions.map((currencyOption, index) => (
          <RadioButtonRow
            key={currencyOption.label}
            title={currencyOption.label}
            onPress={() => handleCurrencyChange(currencyOption.value)}
            isActive={currentCurrency === currencyOption.value}
            isLast={index === currencyOptions.length - 1}
          />
        ))}
      </Surface>
    </BottomModal>
  )
})

export default CurrencySelectModal