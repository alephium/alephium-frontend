import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'

import { TableRowProps } from '@/components/Table'

export interface TransactionRowProps extends TableRowProps {
  tx: e.Transaction
  refAddressHash?: AddressHash
  isInAddressDetailsModal?: boolean
  compact?: boolean
}

export interface TransactionRowSectionProps extends Omit<TransactionRowProps, 'refAddressHash'> {
  refAddressHash: AddressHash
}
