import { useTranslation } from 'react-i18next'
import { RiLockLine } from 'react-icons/ri'

import { DATE_TIME_OPTIONS } from '@/utils/strings'

interface LockTimeIconProps {
  timestamp: number
  className?: string
  color?: string
}

const LockTimeIcon = ({ timestamp, color, className }: LockTimeIconProps) => {
  const { t } = useTranslation()

  const unlocksOn = new Intl.DateTimeFormat(undefined, DATE_TIME_OPTIONS).format(new Date(timestamp))

  return (
    <RiLockLine
      data-tooltip-id="default"
      data-tooltip-content={t('Unlocks on {{ date }}', { date: unlocksOn })}
      className={className}
      color={color}
    />
  )
}

export default LockTimeIcon
