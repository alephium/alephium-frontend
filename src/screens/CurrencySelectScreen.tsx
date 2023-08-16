/*
Copyright 2018 - 2022 The Alephium Authors
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

import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'

import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { currencySelected } from '~/store/settingsSlice'
import { Currency } from '~/types/settings'
import { currencies } from '~/utils/currencies'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'CurrencySelectScreen'>, ScrollScreenProps {}

const currencyOptions = Object.values(currencies).map((currency) => ({
  label: `${currency.name} (${currency.ticker})`,
  value: currency.ticker
}))

const CurrencySelectScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const currentCurrency = useAppSelector((s) => s.settings.currency)

  const handleCurrencyChange = (currency: Currency) => {
    dispatch(currencySelected(currency))
    navigation.goBack()
  }

  return (
    <ScrollScreen {...props}>
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
    </ScrollScreen>
  )
}

export default CurrencySelectScreen
