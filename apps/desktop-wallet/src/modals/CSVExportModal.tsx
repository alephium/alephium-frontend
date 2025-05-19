import { selectAddressByHash } from '@alephium/shared'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Select from '@/components/Inputs/Select'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { csvFileGenerationFinished, fetchTransactionsCsv } from '@/storage/transactions/transactionsActions'
import { TransactionTimePeriod } from '@/types/transactions'
import { generateCsvFile, getCsvExportTimeRangeQueryParams } from '@/utils/csvExport'
import { timePeriodsOptions } from '@/utils/transactions'

const CSVExportModal = ({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()

  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TransactionTimePeriod>('24h')

  if (!address) return null

  const onClose = () => dispatch(closeModal({ id }))

  const handleExportClick = () => {
    onClose()
    getCSVFile()

    sendAnalytics({ event: 'Exported CSV', props: { time_period: selectedTimePeriod } })
  }

  const getCSVFile = async () => {
    const now = dayjs()
    const timeRangeQueryParams = getCsvExportTimeRangeQueryParams(selectedTimePeriod, now)

    const csvData = await dispatch(fetchTransactionsCsv({ addressHash, ...timeRangeQueryParams })).unwrap()
    const fileName = `${addressHash}__${selectedTimePeriod}__${now.format('DD-MM-YYYY')}`
    generateCsvFile(csvData, fileName)

    dispatch(csvFileGenerationFinished())
  }

  return (
    <CenteredModal
      title={t('Export address transactions')}
      subtitle={address.label || address.hash}
      onClose={onClose}
      hasFooterButtons
    >
      <Paragraph>
        {t(
          'You can download the address transaction history for a selected time period. This can be useful for tax reporting.'
        )}
      </Paragraph>
      <Select
        title={t('Time period')}
        options={timePeriodsOptions}
        controlledValue={timePeriodsOptions.find((option) => option.value === selectedTimePeriod)}
        id="timeperiod"
        onSelect={setSelectedTimePeriod}
      />
      <ModalFooterButtons>
        <ModalFooterButton onClick={handleExportClick}>{t('Export')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default CSVExportModal
