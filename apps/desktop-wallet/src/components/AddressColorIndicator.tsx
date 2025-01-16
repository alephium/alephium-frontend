import { AddressHash } from '@alephium/shared'
import styled from 'styled-components'

import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as IndicatorLogo } from '@/images/main_address_badge.svg'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface AddressColorIndicatorProps {
  addressHash: AddressHash
  hideMainAddressBadge?: boolean
  size?: number
  className?: string
}

const AddressColorIndicator = ({
  addressHash,
  hideMainAddressBadge,
  size = 10,
  className
}: AddressColorIndicatorProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)

  if (!address) return null

  return (
    <div className={className}>
      {address.isDefault && !isPassphraseUsed && !hideMainAddressBadge ? (
        <DefaultAddressIndicator color={address.color} size={size}>
          <IndicatorLogo />
        </DefaultAddressIndicator>
      ) : (
        <DotIcon size={size} color={address.color} />
      )}
    </div>
  )
}

export default styled(AddressColorIndicator)`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`

const DefaultAddressIndicator = styled.div<{ color: string; size: number }>`
  position: relative;
  width: ${({ size }) => size}px;
  transform: scale(1.1);

  svg * {
    fill: ${({ color }) => color} !important;
  }
`
