import { AddressHash, TokenId } from '@alephium/shared/types'
import styled, { useTheme } from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import useWalletSingleAddress from '~/hooks/addresses/useWalletSingleAddress'

interface AddressSelectorCardProps {
  label: string
  addressHash: AddressHash
  onPress: () => void
  tokenId?: TokenId // when set, the card shows this token's balance instead of the address' total worth
  disabled?: boolean
}

const AddressSelectorCard = ({ label, addressHash, onPress, tokenId, disabled }: AddressSelectorCardProps) => {
  const theme = useTheme()
  const hasSingleAddress = !!useWalletSingleAddress({ checkBalance: false })

  // Nothing to pick when the wallet has a single address, so hide the selector and keep the UI simple.
  if (hasSingleAddress) return null

  return (
    <Container>
      <AppText color="tertiary" size={13}>
        {label}
      </AppText>
      <AddressBox
        addressHash={addressHash}
        tokenId={tokenId}
        showTokenAmount
        hideAssets
        noBottomMargin
        rounded
        origin="select_address_modal"
        style={{ borderWidth: 1, borderColor: theme.border.primary }}
        disabled={disabled}
        onPress={onPress}
      />
    </Container>
  )
}

export default AddressSelectorCard

const Container = styled.View`
  gap: 8px;
`
