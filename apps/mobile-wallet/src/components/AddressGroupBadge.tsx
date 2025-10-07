import { AddressHash, selectAddressGroup } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import Badge, { BadgeProps } from '~/components/Badge'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'

interface AddressGroupBadgeProps extends Omit<BadgeProps, 'children'> {
  addressHash: AddressHash
}

const AddressGroupBadge = ({ addressHash, ...props }: AddressGroupBadgeProps) => {
  const { t } = useTranslation()
  const addressGroup = useAppSelector((s) => selectAddressGroup(s, addressHash))

  if (addressGroup === undefined) return null

  return (
    <Row title={t('Group')} short>
      <Badge light border {...props}>
        {addressGroup}
      </Badge>
    </Row>
  )
}

export default AddressGroupBadge
