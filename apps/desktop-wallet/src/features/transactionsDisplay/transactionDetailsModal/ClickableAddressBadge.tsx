import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'

interface ClickableAddressBadgeProps {
  address: string
  hideLink?: boolean
}

const ClickableAddressBadge = ({ address, hideLink }: ClickableAddressBadgeProps) => {
  const onAddressClick = useOnAddressClick()

  if (hideLink) {
    return <AddressBadge truncate addressHash={address} withBorders />
  }

  return (
    <ActionLink onClick={() => onAddressClick(address)}>
      <AddressBadge truncate addressHash={address} withBorders />
    </ActionLink>
  )
}

export default ClickableAddressBadge
