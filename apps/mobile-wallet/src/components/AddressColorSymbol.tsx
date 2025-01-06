import { AddressHash } from '@alephium/shared'
import { View } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '~/hooks/redux'
import DefaultAddressBadge from '~/images/DefaultAddressBadge'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'
import { selectAddressByHash } from '~/store/addressesSlice'
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
      {address?.settings.isDefault ? (
        <DefaultAddressBadge size={size + 4} color={address.settings.color} />
      ) : (
        <Dot color={contact ? stringToColour(contact.address) : address?.settings.color} size={size} />
      )}
    </View>
  )
}

export default AddressColorSymbol

const Dot = styled.View<{ color?: string; size?: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
