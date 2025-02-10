import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import Badge, { BadgeProps } from '~/components/Badge'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'

interface AddressGroupBadgeProps extends Omit<BadgeProps, 'children'> {
  addressHash: AddressHash
}

const AddressGroupBadge = ({ addressHash, ...props }: AddressGroupBadgeProps) => {
  const { t } = useTranslation()
  const groupNumber = useAppSelector((s) => selectAddressByHash(s, addressHash)?.group)

  if (groupNumber === undefined) return null

  return <Badge {...props}>{t('Group {{ groupNumber }}', { groupNumber })}</Badge>
}

export default AddressGroupBadge
