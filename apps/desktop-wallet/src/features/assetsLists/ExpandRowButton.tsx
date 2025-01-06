import { ExpandRow } from '@/components/Table'
import { TokensTabsBaseProps } from '@/features/assetsLists/types'

interface ExpandRowButtonProps extends TokensTabsBaseProps {
  isEnabled: boolean
}

const ExpandRowButton = ({ isExpanded, isEnabled, onExpand }: ExpandRowButtonProps) =>
  !isExpanded && isEnabled && onExpand && <ExpandRow onClick={onExpand} />

export default ExpandRowButton
