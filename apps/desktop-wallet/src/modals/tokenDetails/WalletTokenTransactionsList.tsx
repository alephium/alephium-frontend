import WalletTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/WalletTransactionsList'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'

const WalletTokenTransactionsList = ({ tokenId }: TokenDetailsModalProps) => (
  <WalletTransactionsList assetIds={[tokenId]} />
)

export default WalletTokenTransactionsList
