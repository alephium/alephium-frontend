import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const WalletNameRow = () => {
  const { t } = useTranslation()
  const walletName = useAppSelector((s) => s.wallet.name)
  const dispatch = useAppDispatch()

  const openEditWalletNameModal = () => dispatch(openModal({ name: 'EditWalletNameModal' }))

  return (
    <Row onPress={openEditWalletNameModal} title={t('Wallet name')}>
      <AppText bold>{walletName}</AppText>
    </Row>
  )
}

export default WalletNameRow
