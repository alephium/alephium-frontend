import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useSettings } from '@/contexts/settingsContext'
import { DATE_TIME_FORMAT } from '@/utils/strings'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

type Precision = 'high' | 'low'

interface TimestampProps {
  timeInMs: number
  formatToggle?: boolean
  forceFormat?: Precision
  customFormat?: string
  className?: string
}

const Timestamp = ({ timeInMs, className, forceFormat, customFormat, formatToggle = false }: TimestampProps) => {
  const { timestampPrecisionMode } = useSettings()
  const { t } = useTranslation()

  const precision = forceFormat ?? (timestampPrecisionMode === 'on' ? 'high' : 'low')

  const highPrecisionTimestamp = dayjs(timeInMs).format(DATE_TIME_FORMAT)
  const lowPrecisionTimestamp = dayjs().to(timeInMs)
  const customTimestamp = dayjs(timeInMs).format(customFormat)

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
