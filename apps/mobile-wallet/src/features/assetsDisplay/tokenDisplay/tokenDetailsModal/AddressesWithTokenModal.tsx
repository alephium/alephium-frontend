import { AddressHash, isFT } from '@alephium/shared'
import {
  useFetchAddressesHashesWithBalanceSortedByLastUse,
  useFetchToken,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { Token } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressesWithTokenModalProps {
  tokenId: Token['id']
}

const AddressesWithTokenModal = memo<AddressesWithTokenModalProps & ModalBaseProp>(({ tokenId }) => {
  const { data: addresses } = useFetchAddressesHashesWithBalanceSortedByLastUse(tokenId)
  const totalNumberOfAddresses = useUnsortedAddressesHashes().length
  const { dismissModal } = useModalContext()
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handleAddressPress = (addressHash: AddressHash) => {
    dismissModal()
    dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
  }

  return (
    <BottomModal2 title={<Header tokenId={tokenId} />}>
      <IntroText tokenId={tokenId} />
      <Content>
        {addresses.map((addressHash, i) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            isLast={i === addresses.length - 1}
            onPress={() => handleAddressPress(addressHash)}
            tokenId={tokenId}
            origin="selectAddressModal"
          />
        ))}
      </Content>
    </BottomModal2>
  )
})

export default AddressesWithTokenModal

const Header = ({ tokenId }: AddressesWithTokenModalProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <HeaderStyled>
      <AssetLogo assetId={token.id} size={26} />
      <AppText size={16} semiBold numberOfLines={1} style={{ flexShrink: 1 }}>
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
  const { t } = useTranslation()

  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

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
