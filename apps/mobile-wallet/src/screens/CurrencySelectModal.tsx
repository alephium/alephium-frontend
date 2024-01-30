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

import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { currencySelected } from '~/store/settingsSlice'
import { Currency } from '~/types/settings'
import { currencies } from '~/utils/currencies'

const currencyOptions = Object.values(currencies).map((currency) => ({
  label: `${currency.name} (${currency.ticker})`,
  value: currency.ticker
}))

const CurrencySelectModal = ({ onClose, ...props }: ModalContentProps) => {
  const dispatch = useAppDispatch()
  const currentCurrency = useAppSelector((s) => s.settings.currency)

  const handleCurrencyChange = (currency: Currency) => {
    dispatch(currencySelected(currency))
    onClose && onClose()
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BoxSurface>
          {currencyOptions.map((currencyOption) => (
            <RadioButtonRow
              key={currencyOption.label}
              title={currencyOption.label}
              onPress={() => handleCurrencyChange(currencyOption.value)}
              isActive={currentCurrency === currencyOption.value}
            />
          ))}
        </BoxSurface>
      </ScreenSection>
    </ModalContent>
  )
}

export default CurrencySelectModal
