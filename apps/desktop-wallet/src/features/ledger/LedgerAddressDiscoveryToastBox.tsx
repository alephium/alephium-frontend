import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { userWasAskedToDiscoverAddresses } from '@/features/ledger/ledgerActions'
import ToastBox from '@/features/toastMessages/ToastBox'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'

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
      FooterButtons={
        <Button wide squared onClick={handleScanClick}>
          {t('Scan')}
        </Button>
      }
    >
      {t('Would you like to scan for active addresses?')}
    </ToastBox>
  )
})

export default LedgerAddressDiscoveryToastBox
