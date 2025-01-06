import { motion } from 'framer-motion'
import { ReactNode } from 'react'

import { fadeIn } from '@/animations'
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import { TokensTabsBaseProps } from '@/features/assetsLists/types'

interface ExpandableTokensBalancesListProps extends TokensTabsBaseProps {
  children: ReactNode[]
  nbOfItems?: number
}

const ExpandableTokensBalancesList = ({
  className,
  children,
  nbOfItems,
  ...props
}: ExpandableTokensBalancesListProps) => (
  <>
    <motion.div {...fadeIn} className={className}>
      {children}
    </motion.div>
    {nbOfItems !== undefined && <ExpandRowButton {...props} isEnabled={nbOfItems > 3} />}
  </>
)

export default ExpandableTokensBalancesList
