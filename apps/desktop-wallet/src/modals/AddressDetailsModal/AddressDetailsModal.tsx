import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { AddressDetailsTabs } from '@/features/assetsLists/AddressDetailsTabs'
import { AddressModalProps } from '@/features/modals/modalTypes'
import AddressDetailsModalHeader from '@/modals/AddressDetailsModal/AddressDetailsModalHeader'
import AddressWorth from '@/modals/AddressDetailsModal/AddressWorth'
import SideModal from '@/modals/SideModal'

const AddressDetailsModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()

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
        <ShortcutButtonsGroupAddress addressHash={addressHash} analyticsOrigin="address_details" />
        <AddressDetailsTabs addressHash={addressHash} />
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
