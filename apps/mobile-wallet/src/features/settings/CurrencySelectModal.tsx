import { CURRENCIES, Currency, fiatCurrencyChanged } from '@alephium/shared'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const currencyOptions = Object.values(CURRENCIES).map((currency) => ({
  label: `${currency.name} (${currency.ticker})`,
  value: currency.ticker
}))

const CurrencySelectModal = memo(() => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const { dismissModal } = useModalContext()

  const handleCurrencyChange = (currency: Currency) => {
    dispatch(fiatCurrencyChanged(currency))
    dismissModal()
  }

  return (
    <BottomModal2 title={t('Currency')}>
      {currencyOptions.map((currencyOption, index) => (
        <RadioButtonRow
          key={currencyOption.label}
          title={currencyOption.label}
          onPress={() => handleCurrencyChange(currencyOption.value)}
          isActive={currentCurrency === currencyOption.value}
          isLast={index === currencyOptions.length - 1}
        />
      ))}
    </BottomModal2>
  )
})

export default CurrencySelectModal
