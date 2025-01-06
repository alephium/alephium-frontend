import { LucideIcon } from 'lucide-react'

import Button, { ButtonProps } from '@/components/Button'

interface CompactToggleProps extends ButtonProps {
  toggled: boolean
  onToggle: (value: boolean) => void
  IconOn: LucideIcon
  IconOff: LucideIcon
}

const CompactToggle = ({ toggled, onToggle, IconOn, IconOff, ...props }: CompactToggleProps) => (
  <Button squared transparent role="secondary" onClick={() => onToggle(!toggled)} {...props}>
    {toggled ? <IconOn /> : <IconOff />}
  </Button>
)

export default CompactToggle
