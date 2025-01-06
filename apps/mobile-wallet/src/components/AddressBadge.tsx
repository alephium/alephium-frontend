import { AddressHash } from '@alephium/shared'
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressColorSymbol from '~/components/AddressColorSymbol'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'
import { selectAddressByHash } from '~/store/addressesSlice'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressBadgeProps extends PressableProps {
  addressHash: AddressHash
  hideSymbol?: boolean
  textStyle?: StyleProp<TextStyle>
  color?: string
  canCopy?: boolean
  showCopyBtn?: boolean
  alwaysShowHash?: boolean
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({
  addressHash,
  hideSymbol = false,
  textStyle,
  color,
  canCopy = true,
  showCopyBtn,
  ...props
}: AddressBadgeProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))

  const textColor = color || theme.font.primary

  return (
    <Pressable
      onLongPress={() => canCopy && !showCopyBtn && copyAddressToClipboard(addressHash)}
      disabled={!canCopy}
      {...props}
    >
      {address ? (
        <AddressBadgeContainer>
          {!hideSymbol && <AddressColorSymbol addressHash={addressHash} size={16} />}
          {address.settings.label ? (
            <Label numberOfLines={1} style={[textStyle]} color={textColor}>
              {address.settings.label}
            </Label>
          ) : (
            <Label numberOfLines={1} ellipsizeMode="middle" style={[textStyle]} color={textColor}>
              {address.hash}
            </Label>
          )}
        </AddressBadgeContainer>
      ) : contact ? (
        <AddressBadgeContainer>
          {!hideSymbol && <AddressColorSymbol addressHash={contact.address} size={16} />}
          <Label numberOfLines={1} style={[textStyle]} color={textColor}>
            {contact.name}
          </Label>
        </AddressBadgeContainer>
      ) : (
        <Label numberOfLines={1} ellipsizeMode="middle" style={[textStyle]} color={textColor}>
          {addressHash}
        </Label>
      )}
      {showCopyBtn && address?.hash && (
        <CopyAddressButton
          onPress={() => copyAddressToClipboard(address?.hash)}
          iconProps={{ name: 'clipboard' }}
          type="transparent"
          color={color}
          squared
          compact
        />
      )}
    </Pressable>
  )
}

export default styled(AddressBadge)`
  flex-direction: row;
  align-items: center;
`

const AddressBadgeContainer = styled.View`
  flex-direction: row;
  gap: 5px;
  align-items: center;
`

const Label = styled(AppText)`
  font-weight: 600;
  flex-shrink: 1;
`

const CopyAddressButton = styled(Button)``
