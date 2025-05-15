import { CURRENCIES, Currency, fiatCurrencyChanged } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModal2 from '~/features/modals/BottomModal2'
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
    <BottomModal2 modalId={id} title={t('Currency')}>
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
