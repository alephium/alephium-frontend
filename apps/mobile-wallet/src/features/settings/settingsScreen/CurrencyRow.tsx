import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const CurrencyRow = () => {
  const { t } = useTranslation()
  const currentCurrency = useAppSelector((s) => s.settings.currency)
  const dispatch = useAppDispatch()

  const openCurrencySelectModal = () => dispatch(openModal({ name: 'CurrencySelectModal' }))

  return (
    <Row onPress={openCurrencySelectModal} title={t('Currency')}>
      <AppText bold>{currentCurrency}</AppText>
    </Row>
  )
}

export default CurrencyRow
