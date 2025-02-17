import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModalHeader from '@/modals/AddressDetailsModal/AddressDetailsModalHeader'
import { AddressDetailsModalTabs } from '@/modals/AddressDetailsModal/AddressDetailsModalTabs'
import AddressWorth from '@/modals/AddressDetailsModal/AddressWorth'
import SideModal from '@/modals/SideModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

const AddressDetailsModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const addressColor = useAppSelector((s) => selectAddressByHash(s, addressHash)?.color)

  return (
    <SideModal
      id={id}
      title={t('Address details')}
      width={800}
      header={<AddressDetailsModalHeader addressHash={addressHash} />}
    >
      <LabeledWorthOverview label={t('Address worth')}>
        <AddressWorth addressHash={addressHash} />
      </LabeledWorthOverview>
      <Content>
        <AnimatedBackground shade={addressColor} anchorPosition="top" verticalOffset={-300} opacity={0.5} />
        <ShortcutButtonsGroupAddress addressHash={addressHash} analyticsOrigin="address_details" />
        <AddressDetailsModalTabs addressHash={addressHash} />
      </Content>
    </SideModal>
  )
})

export default AddressDetailsModal

const Content = styled.div`
  padding: 0 var(--spacing-4) var(--spacing-4);
  position: relative;
  gap: 45px;
  display: flex;
  flex-direction: column;
`
