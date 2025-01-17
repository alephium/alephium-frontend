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

import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import NetworkSwitch from '@/components/NetworkSwitch'
import AddressWorth from '@/modals/AddressDetailsModal/AddressWorth'
import WalletWorth from '@/pages/UnlockedWallet/OverviewPage/WalletWorth'

interface WorthOverviewPanelProps {
  addressHash?: string
  isLoading?: boolean
  className?: string
  chartVisible?: boolean
  children?: ReactNode
}

const WorthOverviewPanel = ({ className, addressHash, children }: WorthOverviewPanelProps) => {
  const { t } = useTranslation()

  const singleAddress = !!addressHash

  return (
    <WorthOverviewPanelStyled className={className}>
      <Surtitle>
        <Worth>{t(singleAddress ? 'Address worth' : 'Wallet worth')}</Worth>
        <NetworkSwitch />
      </Surtitle>
      {singleAddress ? <AddressWorth addressHash={addressHash} /> : <WalletWorth />}
    </WorthOverviewPanelStyled>
  )
}

export default WorthOverviewPanel

const WorthOverviewPanelStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: var(--spacing-6);
  gap: var(--spacing-2);
`

const Surtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
`

const Worth = styled.span`
  flex: 1;
  white-space: nowrap;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 18px;
  padding-left: 5px;
`
