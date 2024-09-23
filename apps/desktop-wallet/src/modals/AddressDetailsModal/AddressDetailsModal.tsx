/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import { ShortcutButtonsGroupAddress } from '@/components/Buttons/ShortcutButtons'
import QRCode from '@/components/QRCode'
import { AddressTokensTabs } from '@/features/assetsLists/TokensTabs'
import AddressTransactionsCSVExportButton from '@/features/csvExport/AddressTransactionsCSVExportButton'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import TransactionList from '@/features/transactionsDisplay/TransactionList'
import AddressDetailsModalHeader from '@/modals/AddressDetailsModal/AddressDetailsModalHeader'
import SideModal from '@/modals/SideModal'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = memo(({ id, addressHash }: ModalBaseProp & AddressDetailsModalProps) => {
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
      <AmountsOverviewPanelStyled addressHash={addressHash} isChartVisible={showChart} isChartInitiallyHidden>
        <QRCode value={addressHash} size={130} />
      </AmountsOverviewPanelStyled>

      <Content>
        <Shortcuts>
          <ButtonsGrid>
            <ShortcutButtonsGroupAddress addressHash={addressHash} analyticsOrigin="address_details" solidBackground />
          </ButtonsGrid>
        </Shortcuts>
        <AddressTokensTabs addressHash={addressHash} />
        <TransactionList
          title={t('Address transactions')}
          addressHashes={[addressHash]}
          compact
          isInAddressDetailsModal
          headerExtraContent={<AddressTransactionsCSVExportButton addressHash={addressHash} />}
        />
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
