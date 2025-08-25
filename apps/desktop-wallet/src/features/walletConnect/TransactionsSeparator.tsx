import { LucideIcon } from 'lucide-react'
import styled, { useTheme } from 'styled-components'

interface TransactionsSeparatorProps {
  Icon: LucideIcon
}

const TransactionsSeparator = ({ Icon }: TransactionsSeparatorProps) => {
  const theme = useTheme()

  return (
    <Separator>
      <SeparatorLine />
      <SeparatorIcon>
        <Icon size={18} style={{ marginLeft: 'auto', marginRight: 'auto', backgroundColor: theme.bg.background1 }} />
      </SeparatorIcon>
    </Separator>
  )
}

export default TransactionsSeparator

const Separator = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  padding: var(--spacing-2) 0;
`

const SeparatorLine = styled.div`
  height: 2px;
  background-color: ${({ theme }) => theme.border.primary};
  width: 100%;
`

const SeparatorIcon = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
`
