import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import QRCode from '@/components/QRCode'
import WorthOverviewPanel from '@/components/WorthOverviewPanel'
import { AddressTokensTabs } from '@/features/assetsLists/TokensTabs'
import { AddressModalProps } from '@/features/modals/modalTypes'
import AddressTransactionsList from '@/features/transactionsDisplay/transactionLists/lists/AddressTransactionsList'
import AddressDetailsModalHeader from '@/modals/AddressDetailsModal/AddressDetailsModalHeader'
import SideModal from '@/modals/SideModal'

const AddressDetailsModal = memo(({ id, addressHash }: AddressModalProps) => {
  const { t } = useTranslation()

  const [showChart, setShowChart] = useState(false)

  return (
    <SideModal
      id={id}
      title={t('Address details')}
      width={800}
      header={<AddressDetailsModalHeader addressHash={addressHash} />}
      onAnimationComplete={() => setShowChart(true)}
    >
      <WorthOverviewPanelStyled addressHash={addressHash} chartVisible={showChart}>
        <QRCode value={addressHash} size={130} />
      </WorthOverviewPanelStyled>

      <Content>
        <ShortcutButtonsGroupAddress addressHash={addressHash} analyticsOrigin="address_details" solidBackground />

        <AddressTokensTabs addressHash={addressHash} />
        <AddressTransactionsList addressHash={addressHash} />
      </Content>
    </SideModal>
  )
})

export default AddressDetailsModal

const WorthOverviewPanelStyled = styled(WorthOverviewPanel)`
  margin: var(--spacing-4);
  width: auto;
`

const Content = styled.div`
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-4);
  position: relative;
  gap: 45px;
  display: flex;
  flex-direction: column;
`
