import { AddressHash, selectFungibleTokenById } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressesWithToken } from '~/store/addresses/addressesSelectors'
import { selectAllAddresses } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

type AddressesWithTokenModalProps = {
  tokenId: Token['id']
}

const AddressesWithTokenModal = withModal<AddressesWithTokenModalProps>(({ id, tokenId }) => {
  const addresses = useAppSelector((s) => selectAddressesWithToken(s, tokenId))
  const totalNumberOfAddresses = useAppSelector(selectAllAddresses).length
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handleAddressPress = (addressHash: AddressHash) => {
    dispatch(closeModal({ id }))
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <BottomModal modalId={id} title={<Header tokenId={tokenId} />}>
      <IntroText tokenId={tokenId} />
      <Content>
        {addresses.map((address, i) => (
          <AddressBox
            key={address.hash}
            addressHash={address.hash}
            isLast={i === addresses.length - 1}
            onPress={() => handleAddressPress(address.hash)}
          />
        ))}
      </Content>
    </BottomModal>
  )
})

export default AddressesWithTokenModal

const Header = ({ tokenId }: AddressesWithTokenModalProps) => {
  const token = useAppSelector((s) => selectFungibleTokenById(s, tokenId))

  if (!token) return null

  return (
    <HeaderStyled>
      <AssetLogo assetId={token.id} size={38} />
      <AppText size={18} semiBold numberOfLines={1} style={{ flexShrink: 1 }}>
        {token.name}
      </AppText>
    </HeaderStyled>
  )
}

const HeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const IntroText = ({ tokenId }: AddressesWithTokenModalProps) => {
  const token = useAppSelector((s) => selectFungibleTokenById(s, tokenId))
  const { t } = useTranslation()

  if (!token) return null

  return (
    <IntroTextStyled>
      <AppText>
        {t('The {{ tokenSymbol }} token can be found in these addresses:', { tokenSymbol: token.symbol })}
      </AppText>
    </IntroTextStyled>
  )
}

const IntroTextStyled = styled(ScreenSection)`
  margin-top: ${VERTICAL_GAP}px;
`

// TODO: DRY
const Content = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`
