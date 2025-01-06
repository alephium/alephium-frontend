import { getHumanReadableError } from '@alephium/shared'
import dayjs from 'dayjs'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCheckLine } from 'react-icons/ri'
import styled from 'styled-components'

import client from '@/api/client'
import Button from '@/components/Buttons/Button'
import HighlightedHash from '@/components/HighlightedHash'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal, { ModalProps } from '@/components/Modal/Modal'
import Select, { SelectListItem } from '@/components/Select'
import i18n from '@/features/localization/i18n'
import { useSnackbar } from '@/hooks/useSnackbar'
import { SIMPLE_DATE_FORMAT } from '@/utils/strings'

type TimePeriodValue =
  | '24h'
  | '1w'
  | '1m'
  | '6m'
  | '12m'
  | 'currentYear'
  | 'oneYearAgo'
  | 'twoYearsAgo'
  | 'threeYearsAgo'

interface ExportAddressTXsModalProps extends Omit<ModalProps, 'children'> {
  addressHash: string
}

const ExportAddressTXsModal = ({ addressHash, onClose, ...props }: ExportAddressTXsModalProps) => {
  const { displaySnackbar } = useSnackbar()
  const { t } = useTranslation()

  const [timePeriodValue, setTimePeriodValue] = useState<TimePeriodValue>('24h')

  const getCSVFile = useCallback(async () => {
    onClose()

    displaySnackbar({
      text: `${t("Your CSV is being compiled in the background (don't close this tab)")}...`,
      type: 'info',
      Icon: <LoadingSpinner size={20} style={{ color: 'inherit' }} />,
      duration: -1
    })

    try {
      const data = await client.explorer.addresses.getAddressesAddressExportTransactionsCsv(
        addressHash,
        {
          fromTs: timePeriods[timePeriodValue].from,
          toTs: timePeriods[timePeriodValue].to
        },
        {
          // Don't forget to define the format field in order to show errors! (cf. swagger-typescript-api code)
          format: 'text' // We expect a CSV. Careful: errors would be returned as a string as well.
        }
      )

      if (!data) throw t('Something wrong happened while fetching the data.')

      const fileDateFrom = dayjs(timePeriods[timePeriodValue].from).format(SIMPLE_DATE_FORMAT)
      const fileDateTo = dayjs(timePeriods[timePeriodValue].to).format(SIMPLE_DATE_FORMAT)

      startCSVFileDownload(data, `${addressHash}__${fileDateFrom}-${fileDateTo}`)

      displaySnackbar({
        text: t('Your CSV has been successfully downloaded.'),
        type: 'success',
        Icon: <RiCheckLine size={14} />
      })
    } catch (e) {
      console.error(e)

      displaySnackbar({
        text: getHumanReadableError(e, t('Problem while downloading the CSV file')),
        type: 'alert',
        duration: 5000
      })
    }
  }, [addressHash, displaySnackbar, onClose, t, timePeriodValue])

  return (
    <Modal maxWidth={550} onClose={onClose} {...props}>
      <h2>{t('Export address transactions')}</h2>
      <HighlightedHash text={addressHash} middleEllipsis maxWidth="200px" textToCopy={addressHash} />
      <Explanations>
        {t(
          'You can download the address transaction history for a selected time period. This can be useful for tax reporting.'
        )}
      </Explanations>
      <Selects>
        <Select
          title={t('Time period')}
          items={timePeriodsItems}
          selectedItemValue={timePeriodValue}
          onItemClick={(v) => setTimePeriodValue(v)}
        />
      </Selects>
      <FooterButton>
        <Button accent big onClick={getCSVFile}>
          {t('Export')}
        </Button>
      </FooterButton>
    </Modal>
  )
}

const now = dayjs()
const thisMoment = now.valueOf()
const lastYear = now.subtract(1, 'year')
const twoYearsAgo = now.subtract(2, 'year')
const threeYearsAgo = now.subtract(3, 'year')
const today = now.format(SIMPLE_DATE_FORMAT)

const timePeriodsItems: SelectListItem<TimePeriodValue>[] = [
  {
    value: '24h',
    label: i18n.t('Last 24h')
  },
  {
    value: '1w',
    label: i18n.t('Last week')
  },
  {
    value: '1m',
    label: i18n.t('Last month')
  },
  {
    value: '6m',
    label: i18n.t('Last 6 months')
  },
  {
    value: '12m',
    label: i18n.t('Last 12 months')
  },
  {
    value: 'currentYear',
    label: `${i18n.t('This year so far')} (01/01/${now.year()} - ${today})`
  },
  {
    value: 'oneYearAgo',
    label: `${i18n.t('Last year')} (${lastYear.year()})`
  },
  {
    value: 'twoYearsAgo',
    label: `${i18n.t('Two years ago')}
    (${twoYearsAgo.year()})`
  },
  {
    value: 'threeYearsAgo',
    label: `${i18n.t('Three years ago')}
    (${threeYearsAgo.year()})`
  }
]

const timePeriods: Record<TimePeriodValue, { from: number; to: number }> = {
  '24h': { from: now.subtract(24, 'hour').valueOf(), to: thisMoment },
  '1w': { from: now.subtract(7, 'day').valueOf(), to: thisMoment },
  '1m': { from: now.subtract(30, 'day').valueOf(), to: thisMoment },
  '6m': { from: now.subtract(6, 'month').valueOf(), to: thisMoment },
  '12m': { from: now.subtract(12, 'month').valueOf(), to: thisMoment },
  currentYear: { from: now.startOf('year').valueOf(), to: thisMoment },
  oneYearAgo: {
    from: lastYear.startOf('year').valueOf(),
    to: lastYear.endOf('year').valueOf()
  },
  twoYearsAgo: {
    from: twoYearsAgo.startOf('year').valueOf(),
    to: twoYearsAgo.endOf('year').valueOf()
  },
  threeYearsAgo: {
    from: threeYearsAgo.startOf('year').valueOf(),
    to: threeYearsAgo.endOf('year').valueOf()
  }
}

const startCSVFileDownload = (csvContent: string, fileName: string) => {
  const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export default styled(ExportAddressTXsModal)`
  padding: 20px 30px;
`

const Explanations = styled.p`
  color: ${({ theme }) => theme.font.secondary};
  margin: 30px 0 40px 0;
  line-height: 20px;
`

const Selects = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`

const FooterButton = styled.div`
  bottom: 0;
  right: 0;
  left: 0;
  margin: 50px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`
