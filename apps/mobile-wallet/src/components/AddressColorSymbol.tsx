import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { View } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'
import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'
import { stringToColour } from '~/utils/colors'

interface AddressColorSymbolProps {
  addressHash: AddressHash
  size?: number
}

const AddressColorSymbol = ({ addressHash, size = 10 }: AddressColorSymbolProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))

  if (!address && !contact) return

  return (
    <View>
      {address?.isDefault ? (
        <DefaultAddressBadge size={size} color={address.color} />
      ) : (
        <Dot color={contact ? stringToColour(contact.address) : address?.color} size={size} />
      )}
    </View>
  )
}

export default AddressColorSymbol

const Dot = styled.View<{ color?: string; size?: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
