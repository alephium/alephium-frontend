import { SHORT_DATE_TIME_OPTIONS } from '@alephium/shared'
import { Lock as LockIcon, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface LockProps {
  unlockAt?: Date
  className?: string
}

const Lock = ({ unlockAt, className }: LockProps) => {
  const { t, i18n } = useTranslation()

  if (!unlockAt) return null

  const lockTimeInPast = unlockAt < new Date()
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    ...SHORT_DATE_TIME_OPTIONS,
    hour: 'numeric',
    hour12: true
  }).format(unlockAt)
  const tooltipContent = `${lockTimeInPast ? t`Unlocked at` : t`Unlocks at`} ${formattedDate}`

  return (
    <span className={className} data-tooltip-id="default" data-tooltip-content={tooltipContent}>
      {lockTimeInPast ? <UnlockIconStyled /> : <LockIconStyled />}
    </span>
  )
}

export default styled(Lock)`
  display: flex;
`

const UnlockIconStyled = styled(Unlock)`
  width: 1em;
`

const LockIconStyled = styled(LockIcon)`
  width: 1em;
`
