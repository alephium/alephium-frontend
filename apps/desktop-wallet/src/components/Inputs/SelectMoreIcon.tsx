import { ChevronsUpDown } from 'lucide-react'
import styled, { useTheme } from 'styled-components'

import { inputStyling } from '@/components/Inputs'

const SelectMoreIcon = () => {
  const theme = useTheme()
  return (
    <MoreIcon>
      <ChevronsUpDown size={14} color={theme.font.tertiary} strokeWidth={1} />
    </MoreIcon>
  )
}

export default SelectMoreIcon

const MoreIcon = styled.div`
  position: absolute;
  right: ${inputStyling.paddingLeftRight};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
  z-index: 1;
`
