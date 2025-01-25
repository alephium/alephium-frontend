import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import LabeledWorthOverview from '@/components/LabeledWorthOverview'
import { AddressDetailsTabs } from '@/features/assetsLists/AddressDetailsTabs'
import { AddressModalProps } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModalHeader from '@/modals/AddressDetailsModal/AddressDetailsModalHeader'
import SideModal from '@/modals/SideModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

const AddressDetailsModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()
  const addressColor = useAppSelector((s) => selectAddressByHash(s, addressHash)?.color)

  const [showChart, setShowChart] = useState(false)

  return (
    <SideModal
      id={id}
      title={t('Address details')}
      width={800}
      header={<AddressDetailsModalHeader addressHash={addressHash} />}
      onAnimationComplete={() => setShowChart(true)}
    >
      <LabeledWorthOverview addressHash={addressHash} chartVisible={showChart} />
      <Content>
        <AnimatedBackground shade={addressColor} anchorPosition="top" verticalOffset={-300} opacity={0.5} />
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
