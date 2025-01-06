import dayjs from 'dayjs'
import { Lock as LockIcon, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface LockProps {
  unlockAt?: Date
  className?: string
}

const Lock = ({ unlockAt, className }: LockProps) => {
  const { t } = useTranslation()

  if (!unlockAt) return null

  const lockTimeInPast = unlockAt < new Date()
  const tooltipContent = `${lockTimeInPast ? t`Unlocked at` : t`Unlocks at`} ${dayjs(unlockAt).format(
    'DD/MM/YYYY hh:mm A'
  )}`

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
