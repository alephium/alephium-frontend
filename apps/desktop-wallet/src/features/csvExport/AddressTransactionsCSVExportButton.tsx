import { AddressHash } from '@alephium/shared'
import { FileDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface AddressTransactionsCSVExportButton {
  addressHash: AddressHash
}

const AddressTransactionsCSVExportButton = ({ addressHash }: AddressTransactionsCSVExportButton) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openCSVExportModal = () => dispatch(openModal({ name: 'CSVExportModal', props: { addressHash } }))

  return (
    <Button short role="secondary" Icon={FileDown} onClick={openCSVExportModal}>
      {t('Export')}
    </Button>
  )
}

export default AddressTransactionsCSVExportButton
