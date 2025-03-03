import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import ButtonTooltipWrapper from '@/components/Buttons/ButtonTooltipWrapper'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const WalletQRCodeExportButton = () => {
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openWalletQRCodeExportModal = () => dispatch(openModal({ name: 'WalletQRCodeExportModal' }))

  return (
    <ButtonTooltipWrapper
      data-tooltip-id="default"
      data-tooltip-content={isPassphraseUsed ? t('To export this wallet use it without a passphrase') : ''}
    >
      <Button role="secondary" onClick={openWalletQRCodeExportModal} disabled={isPassphraseUsed}>
        {t('Export current wallet')}
      </Button>
    </ButtonTooltipWrapper>
  )
}

export default WalletQRCodeExportButton
