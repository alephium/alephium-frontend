import dayjs from 'dayjs'

import { CsvExportTimerangeQueryParams, TransactionTimePeriod } from '@/types/transactions'

export const getCsvExportTimeRangeQueryParams = (
  selectedTimePeriod: TransactionTimePeriod,
  now: dayjs.Dayjs
): CsvExportTimerangeQueryParams => {
  const thisMoment = now.valueOf()
  const lastYear = now.subtract(1, 'year')

  return {
    '24h': { fromTs: now.subtract(24, 'hour').valueOf(), toTs: thisMoment },
    '1w': { fromTs: now.subtract(7, 'day').valueOf(), toTs: thisMoment },
    '1m': { fromTs: now.subtract(30, 'day').valueOf(), toTs: thisMoment },
    '6m': { fromTs: now.subtract(6, 'month').valueOf(), toTs: thisMoment },
    '12m': { fromTs: now.subtract(12, 'month').valueOf(), toTs: thisMoment },
    previousYear: {
      fromTs: lastYear.startOf('year').valueOf(),
      toTs: lastYear.endOf('year').valueOf()
    },
    thisYear: { fromTs: now.startOf('year').valueOf(), toTs: thisMoment }
  }[selectedTimePeriod]
}

export const generateCsvFile = (csvContent: string, fileName: string) => {
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
