import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'

const ClickableAddressBadge = ({ address }: { address: string }) => {
  const onAddressClick = useOnAddressClick()

  return (
    <ActionLink onClick={() => onAddressClick(address)}>
      <AddressBadge truncate addressHash={address} withBorders />
    </ActionLink>
  )
}

export default ClickableAddressBadge
