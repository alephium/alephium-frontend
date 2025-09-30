import { LucideIcon } from 'lucide-react'

import Button, { ButtonProps } from '@/components/Button'

interface CompactToggleProps extends ButtonProps {
  toggled: boolean
  IconOn: LucideIcon
  IconOff: LucideIcon
}

const CompactToggle = ({ toggled, onToggle, IconOn, IconOff, ...props }: CompactToggleProps) => (
  <Button circle transparent role="secondary" {...props} Icon={toggled ? IconOn : IconOff} />
)

export default CompactToggle
