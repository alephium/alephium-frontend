import { AddressHash } from '@alephium/shared'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AnimatedBackground from '~/components/AnimatedBackground'
import BalanceSummary from '~/components/BalanceSummary'
import RoundedCard from '~/components/RoundedCard'
import BottomModal from '~/features/modals/BottomModal'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return (
    <BottomModal modalId={id} title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <Content>
        <RoundedCard>
          <AnimatedBackground shade={address?.settings.color} isAnimated />
          <BalanceSummary addressHash={addressHash} />
        </RoundedCard>
      </Content>
    </BottomModal>
  )
})

export default AddressDetailsModal

const Content = styled.View`
  padding: ${VERTICAL_GAP}px 0;
`
