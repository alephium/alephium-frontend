import { AddressHash, isFT, TokenId } from '@alephium/shared/types'
import { useFetchAddressesHashesWithBalanceSortedByLastUse, useFetchToken } from '@alephium/shared-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

interface SwapFromAddressModalProps {
  tokenId: TokenId
  selectedAddressHash: AddressHash
  onSelectAddress: (addressHash: AddressHash) => void
}

const SwapFromAddressModal = memo<SwapFromAddressModalProps>(({ tokenId, selectedAddressHash, onSelectAddress }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const { data: addressHashes } = useFetchAddressesHashesWithBalanceSortedByLastUse(tokenId)
  const { data: token } = useFetchToken(tokenId)

  const symbol = token && isFT(token) ? token.symbol : undefined

  const handleAddressPress = (addressHash: AddressHash) => {
    dismissModal()
    onSelectAddress(addressHash)
  }

  if (addressHashes.length === 0)
    return (
      <BottomModal title={t('Pay from')} notScrollable>
        <EmptyState>
          <AppText color="secondary" size={15}>
            {symbol ? t('No address holds {{ symbol }}', { symbol }) : t('No address holds this token')}
          </AppText>
        </EmptyState>
      </BottomModal>
    )

  return (
    <BottomModal
      title={t('Pay from')}
      flashListProps={{
        data: addressHashes,
        renderItem: ({ item: addressHash, index }) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            tokenId={tokenId}
            showTokenAmount
            hideAssets
            isSelected={addressHash === selectedAddressHash}
            onPress={() => handleAddressPress(addressHash)}
            isLast={index === addressHashes.length - 1}
            origin="select_address_modal"
            showGroup
          />
        )
      }}
    />
  )
})

export default SwapFromAddressModal

const EmptyState = styled.View`
  padding: ${VERTICAL_GAP}px ${DEFAULT_MARGIN}px;
  align-items: center;
`
