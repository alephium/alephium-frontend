import { AddressHash, selectAddressByHash } from '@alephium/shared'

import Badge, { BadgeProps } from '~/components/Badge'
import { useAppSelector } from '~/hooks/redux'

interface AddressGroupBadgeProps extends Omit<BadgeProps, 'children'> {
  addressHash: AddressHash
}

const AddressGroupBadge = ({ addressHash, ...props }: AddressGroupBadgeProps) => {
  const groupNumber = useAppSelector((s) => selectAddressByHash(s, addressHash)?.group)

  if (groupNumber === undefined) return null

  return (
    <Badge light border {...props}>
      {groupNumber}
    </Badge>
  )
}

export default AddressGroupBadge
