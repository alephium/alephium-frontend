import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AmountsOverviewPanel from '@/components/AmountsOverviewPanel'
import Box from '@/components/Box'
import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import QRCode from '@/components/QRCode'
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
      <AmountsOverviewPanelStyled addressHash={addressHash} chartVisible={showChart} chartInitiallyHidden>
        <QRCode value={addressHash} size={130} />
      </AmountsOverviewPanelStyled>

      <Content>
        <Shortcuts>
          <ButtonsGrid>
            <ShortcutButtonsGroupAddress addressHash={addressHash} analyticsOrigin="address_details" solidBackground />
          </ButtonsGrid>
        </Shortcuts>
        <AddressTokensTabs addressHash={addressHash} />
        <AddressTransactionsList addressHash={addressHash} />
      </Content>
    </SideModal>
  )
})

export default AddressDetailsModal

const AmountsOverviewPanelStyled = styled(AmountsOverviewPanel)`
  padding: 0;
`

const Content = styled.div`
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-4);
  position: relative;
  gap: 45px;
  display: flex;
  flex-direction: column;
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
  margin: 0 60px;
  border-radius: 100px;
  width: auto;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
