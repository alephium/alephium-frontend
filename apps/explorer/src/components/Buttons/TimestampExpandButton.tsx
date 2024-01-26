/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { IconBaseProps } from 'react-icons'
import { RiContractLeftRightLine, RiExpandLeftRightLine } from 'react-icons/ri'
import styled from 'styled-components'

import { useSettings } from '@/contexts/settingsContext'
import { OnOff } from '@/types/generics'

interface TimestampExpandButtonProps {
  className?: string
}

const config: Record<OnOff, { Icon: (props: IconBaseProps) => JSX.Element; tooltipContent: string }> = {
  on: {
    Icon: RiContractLeftRightLine,
    tooltipContent: 'Switch to simple time'
  },
  off: {
    Icon: RiExpandLeftRightLine,
    tooltipContent: 'Switch to precise time'
  }
}

const TimestampExpandButton = ({ className }: TimestampExpandButtonProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useSettings()

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
