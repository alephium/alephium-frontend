import { useFetchAddressTransactionsCount } from '@alephium/shared-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiFileDownloadLine } from 'react-icons/ri'

import Button from '@/components/Buttons/Button'
import ModalPortal from '@/modals/ModalPortal'
import ExportAddressTXsModal from '@/pages/AddressInfoPage/ExportAddressTXsModal'

interface AddressTransactionsExportButtonProps {
  addressStr: string
}

const AddressTransactionsExportButton = ({ addressStr }: AddressTransactionsExportButtonProps) => {
  const { t } = useTranslation()
  const { data: txNumber } = useFetchAddressTransactionsCount(addressStr)

  const [exportModalShown, setExportModalShown] = useState(false)

  const handleExportModalOpen = () => setExportModalShown(true)
  const handleExportModalClose = () => setExportModalShown(false)

  if (!txNumber) return null

  return (
    <>
      <Button onClick={handleExportModalOpen}>
        <RiFileDownloadLine size={16} />
        {t('Download CSV')}
      </Button>
      <ModalPortal>
        <ExportAddressTXsModal addressHash={addressStr} isOpen={exportModalShown} onClose={handleExportModalClose} />
      </ModalPortal>
    </>
  )
}

export default AddressTransactionsExportButton
