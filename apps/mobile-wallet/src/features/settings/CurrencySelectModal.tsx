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
