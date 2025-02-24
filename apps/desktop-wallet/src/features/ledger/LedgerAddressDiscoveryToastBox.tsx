import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { userWasAskedToDiscoverAddresses } from '@/features/ledger/ledgerActions'
import ToastBox from '@/features/toastMessages/ToastBox'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { ModalFooterButton } from '@/modals/CenteredModal'

const LedgerAddressDiscoveryToastBox = memo(() => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { discoverAndSaveUsedAddresses } = useAddressGeneration()

  const handleCloseClick = () => {
    dispatch(userWasAskedToDiscoverAddresses())
  }

  const handleScanClick = () => {
    discoverAndSaveUsedAddresses()
    dispatch(userWasAskedToDiscoverAddresses())
  }

  return (
    <ToastBox
      className="info"
      onClose={handleCloseClick}
      title={t('Welcome to your Ledger!') + ' 👋'}
      FooterButtons={<ModalFooterButton onClick={handleScanClick}>{t('Scan')}</ModalFooterButton>}
    >
      {t('Would you like to scan for active addresses?')}
    </ToastBox>
  )
})

export default LedgerAddressDiscoveryToastBox
