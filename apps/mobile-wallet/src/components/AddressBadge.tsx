import { AddressHash } from '@alephium/shared'
import { Pressable, PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressColorSymbol from '~/components/AddressColorSymbol'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash, selectContactByHash } from '~/store/addresses/addressesSelectors'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressBadgeProps extends PressableProps {
  addressHash: AddressHash
  hideSymbol?: boolean
  textStyle?: StyleProp<TextStyle>
  color?: string
  fontSize?: number
  canCopy?: boolean
  showCopyBtn?: boolean
  showHash?: boolean
  style?: StyleProp<ViewStyle>
}

const AddressBadge = ({
  addressHash,
  hideSymbol = false,
  textStyle,
  color,
  canCopy = true,
  fontSize,
  showCopyBtn,
  showHash,
  ...props
}: AddressBadgeProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))

  const textColor = color || theme.font.primary

  const Hash = (
    <Label truncate ellipsizeMode="middle" style={[textStyle, { maxWidth: 110 }]} color={textColor} size={fontSize}>
      {address?.hash}
    </Label>
  )

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
            <>
              <Label truncate style={textStyle} color={textColor} size={fontSize}>
                {address.settings.label}
              </Label>
              {showHash && <View style={{ opacity: 0.5 }}>{Hash}</View>}
            </>
          ) : (
            Hash
          )}
        </AddressBadgeContainer>
      ) : contact ? (
        <AddressBadgeContainer>
          {!hideSymbol && <AddressColorSymbol addressHash={contact.address} size={16} />}
          <Label truncate style={textStyle} color={textColor} size={fontSize}>
            {contact.name}
          </Label>
        </AddressBadgeContainer>
      ) : (
        Hash
      )}
      {showCopyBtn && address?.hash && (
        <CopyAddressButton
          onPress={() => copyAddressToClipboard(address.hash)}
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
  gap: 10px;
  align-items: center;
`

const Label = styled(AppText)`
  font-weight: 600;
  flex-shrink: 1;
`

const CopyAddressButton = styled(Button)``
