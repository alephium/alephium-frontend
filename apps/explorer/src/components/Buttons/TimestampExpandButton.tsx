import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { IconBaseProps } from 'react-icons'
import { RiContractLeftRightLine, RiExpandLeftRightLine } from 'react-icons/ri'
import styled from 'styled-components'

import { useSettings } from '@/contexts/settingsContext'
import { OnOff } from '@/types/generics'

interface TimestampExpandButtonProps {
  className?: string
}

const TimestampExpandButton = ({ className }: TimestampExpandButtonProps) => {
  const { t } = useTranslation()
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useSettings()

  const config: Record<OnOff, { Icon: (props: IconBaseProps) => ReactNode; tooltipContent: string }> = {
    on: {
      Icon: RiContractLeftRightLine,
      tooltipContent: t('Switch to simple time')
    },
    off: {
      Icon: RiExpandLeftRightLine,
      tooltipContent: t('Switch to precise time')
    }
  }

  const handleClick = () => {
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
  }
  const { Icon, tooltipContent } = config[timestampPrecisionMode]

  return (
    <span className={className} onClick={handleClick} data-tooltip-id="default" data-tooltip-content={tooltipContent}>
      <Icon size={11} />
    </span>
  )
}

export default styled(TimestampExpandButton)`
  cursor: pointer;
  color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => theme.bg.accent};
  border-radius: 4px;
  height: 14px;
  width: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 3px;
`
