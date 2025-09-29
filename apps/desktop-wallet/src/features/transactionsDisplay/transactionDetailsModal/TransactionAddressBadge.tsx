import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'

interface TransactionAddressBadgeProps {
  address: string
  hideLink?: boolean
}

const TransactionAddressBadge = ({ address, hideLink }: TransactionAddressBadgeProps) => {
  if (hideLink) {
    return <AddressBadge truncate addressHash={address} withBorders />
  }

  return <ClickableAddressBadge address={address} />
}

export default TransactionAddressBadge

const ClickableAddressBadge = ({ address }: { address: string }) => {
  const onAddressClick = useOnAddressClick()

  return (
    <ActionLink onClick={() => onAddressClick(address)}>
      <AddressBadge truncate addressHash={address} withBorders />
    </ActionLink>
  )
}
