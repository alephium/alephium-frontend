import { AddressHash } from '@alephium/shared'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as IndicatorLogo } from '@/images/main_address_badge.svg'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { useDisplayColor } from '@/utils/colors'

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
  const displayColor = useDisplayColor(address?.color, true)

  if (!address) return null

  const color = displayColor || address.color

  return (
    <div className={className}>
      {address.isDefault && !isPassphraseUsed && !hideMainAddressBadge ? (
        <DefaultAddressIndicator color={color} size={size}>
          <IndicatorLogo />
        </DefaultAddressIndicator>
      ) : (
        <Indicator size={size} color={color} />
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

const Indicator = styled.div<{ size: number; color: string }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  background-color: ${({ color }) => color};
  border-radius: ${({ size }) => size / 3}px;
`
