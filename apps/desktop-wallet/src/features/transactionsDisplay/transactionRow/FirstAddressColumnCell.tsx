import { TransactionOriginAddressesList } from '@/features/transactionsDisplay/transactionDetailsModal/InputsOutputsLists'
import AddressCell from '@/features/transactionsDisplay/transactionRow/AddressCell'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const FirstAddressColumnCell = ({ tx, referenceAddress }: TransactionRowSectionProps) => (
  <AddressCell alignRight>
    <TransactionOriginAddressesList tx={tx} referenceAddress={referenceAddress} view="wallet" hideLink />
  </AddressCell>
)

export default FirstAddressColumnCell
