import { MoreVertical } from 'lucide-react'
import styled, { useTheme } from 'styled-components'

import { inputStyling } from '@/components/Inputs'

const SelectMoreIcon = () => {
  const theme = useTheme()
  return (
    <MoreIcon>
      <MoreVertical size={16} color={theme.font.tertiary} />
    </MoreIcon>
  )
}

export default SelectMoreIcon

const MoreIcon = styled.div`
  position: absolute;
  right: ${inputStyling.paddingLeftRight};
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
  z-index: 1;
`
