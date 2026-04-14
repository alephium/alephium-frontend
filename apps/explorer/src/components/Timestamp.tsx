import { formatRelativeTime, ONE_DAY_MS } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSettings } from '@/contexts/settingsContext'
import { DATE_TIME_OPTIONS, SIMPLE_DATE_OPTIONS } from '@/utils/strings'

type Precision = 'high' | 'low'

interface TimestampProps {
  timeInMs: number
  formatToggle?: boolean
  forceFormat?: Precision
  customFormat?: Intl.DateTimeFormatOptions
  className?: string
}

const Timestamp = ({ timeInMs, className, forceFormat, customFormat, formatToggle = false }: TimestampProps) => {
  const { timestampPrecisionMode } = useSettings()
  const { t } = useTranslation()

  const precision = forceFormat ?? (timestampPrecisionMode === 'on' ? 'high' : 'low')

  const date = new Date(timeInMs)
  const highPrecisionTimestamp = new Intl.DateTimeFormat(undefined, DATE_TIME_OPTIONS).format(date)
  const lowPrecisionTimestamp =
    timeInMs < Date.now() - ONE_DAY_MS
      ? new Intl.DateTimeFormat(undefined, SIMPLE_DATE_OPTIONS).format(date)
      : formatRelativeTime(timeInMs)
  const customTimestamp = customFormat ? new Intl.DateTimeFormat(undefined, customFormat).format(date) : undefined

  return (
    <div
      data-tooltip-id="default"
      data-tooltip-content={
        forceFormat !== 'high'
          ? `${highPrecisionTimestamp}
            ${
              formatToggle ? (
                <span>
                  <br />
                  {t('Click to change format')}
                </span>
              ) : (
                ''
              )
            }`
          : undefined
      }
      data-multiline
      className={className}
    >
      {precision === 'high' ? highPrecisionTimestamp : customFormat ? customTimestamp : lowPrecisionTimestamp}
    </div>
  )
}

export default styled(Timestamp)`
  overflow: hidden;
  text-overflow: ellipsis;
`
