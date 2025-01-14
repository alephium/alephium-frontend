import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import { openModal } from '~/features/modals/modalActions'
import { TokenDetailsModalCommonProps } from '~/features/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressesWithToken } from '~/store/addresses/addressesSelectors'
import { selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface TokenDetailsModalAddressesProps extends TokenDetailsModalCommonProps {
  onAddressPress: () => void
}

const TokenDetailsModalAddresses = ({ tokenId, onAddressPress }: TokenDetailsModalAddressesProps) => {
  const addresses = useAppSelector((s) => selectAddressesWithToken(s, tokenId))
  const totalNumberOfAddresses = useAppSelector(selectAllAddresses).length
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))

    onAddressPress()
  }

  return (
    <TokenDetailsModalAddressesStyled>
      <AppText bold size={18}>
        {t('Addresses with this token')}
      </AppText>

      {addresses.map((address, i) => (
        <AddressBox
          key={address.hash}
          addressHash={address.hash}
          isLast={i === addresses.length - 1}
          onPress={() => handleAddressPress(address.hash)}
        />
      ))}
    </TokenDetailsModalAddressesStyled>
  )
}

export default TokenDetailsModalAddresses

const TokenDetailsModalAddressesStyled = styled.View`
  margin-top: ${VERTICAL_GAP}px;
`
