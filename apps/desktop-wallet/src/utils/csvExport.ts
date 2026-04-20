import { ONE_DAY_MS, ONE_WEEK_MS, subtractMonths } from '@alephium/shared'

import { CsvExportTimerangeQueryParams, TransactionTimePeriod } from '@/types/transactions'

export const getCsvExportTimeRangeQueryParams = (
  selectedTimePeriod: TransactionTimePeriod,
  now: Date
): CsvExportTimerangeQueryParams => {
  const thisMoment = now.getTime()
  const currentYear = now.getFullYear()

  return {
    '24h': { fromTs: thisMoment - ONE_DAY_MS, toTs: thisMoment },
    '1w': { fromTs: thisMoment - ONE_WEEK_MS, toTs: thisMoment },
    '1m': { fromTs: thisMoment - 30 * ONE_DAY_MS, toTs: thisMoment },
    '6m': { fromTs: subtractMonths(now, 6).getTime(), toTs: thisMoment },
    '12m': { fromTs: subtractMonths(now, 12).getTime(), toTs: thisMoment },
    previousYear: {
      fromTs: new Date(currentYear - 1, 0, 1).getTime(),
      toTs: new Date(currentYear, 0, 0).getTime()
    },
    thisYear: { fromTs: new Date(currentYear, 0, 1).getTime(), toTs: thisMoment }
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
