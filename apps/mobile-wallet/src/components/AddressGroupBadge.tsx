import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { isGrouplessAddress } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import Badge, { BadgeProps } from '~/components/Badge'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'

interface AddressGroupBadgeProps extends Omit<BadgeProps, 'children'> {
  addressHash: AddressHash
}

const AddressGroupBadge = ({ addressHash, ...props }: AddressGroupBadgeProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address || isGrouplessAddress(addressHash)) return null

  return (
    <Row title={t('Group')} isLast short>
      <Badge light border {...props}>
        {address.group}
      </Badge>
    </Row>
  )
}

export default AddressGroupBadge
