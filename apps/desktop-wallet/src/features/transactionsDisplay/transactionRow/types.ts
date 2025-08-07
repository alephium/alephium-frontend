import { AddressHash, TransactionView } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

import { TableRowProps } from '@/components/Table'

export interface TransactionRowProps extends TableRowProps {
  tx: e.Transaction
  view: TransactionView
  referenceAddress?: AddressHash
  compact?: boolean
}

export interface TransactionRowSectionProps extends Omit<TransactionRowProps, 'referenceAddress'> {
  referenceAddress: AddressHash
}
