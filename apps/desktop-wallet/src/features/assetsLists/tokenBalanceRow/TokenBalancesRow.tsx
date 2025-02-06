import { ReactNode } from 'react'

import { TableRow } from '@/components/Table'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface TokenBalancesRowProps extends TokenBalancesRowBaseProps {
  children: ReactNode
}

const TokenBalancesRow = ({ tokenId, children }: TokenBalancesRowProps) => {
  const dispatch = useAppDispatch()

  const openTokenDetailsModal = () => dispatch(openModal({ name: 'TokenDetailsModal', props: { tokenId } }))

  return (
    <TableRow key={tokenId} role="row" onClick={openTokenDetailsModal}>
      {children}
    </TableRow>
  )
}

export default TokenBalancesRow
