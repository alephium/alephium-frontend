import { AnimatePresence, motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import styled from 'styled-components'

import { fadeInSlowly } from '@/animations'
import { TableRow } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface TokenBalancesRowProps extends TokenBalancesRowBaseProps {
  children: ReactNode
}

const TokenBalancesRow = ({ tokenId, children }: TokenBalancesRowProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const dispatch = useAppDispatch()

  const openTokenDetailsModal = () => dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId } }))

  return (
    <TableRow key={tokenId} role="row" onClick={openTokenDetailsModal} ref={ref}>
      <AnimatePresence>{isInView && <TokenRow {...fadeInSlowly}>{children}</TokenRow>}</AnimatePresence>
    </TableRow>
  )
}

export default TokenBalancesRow

const TokenRow = styled(motion.div)`
  display: flex;
  align-items: center;
  flex-grow: 1;
`
