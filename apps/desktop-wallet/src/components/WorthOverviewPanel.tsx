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

import AnimatedBackground from '@/components/AnimatedBackground'
import Box from '@/components/Box'
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
      <AnimatedBackground height={600} />
      <Panel>
        <Balances>
          <BalancesRow>
            <BalancesColumn>
              <Today>{t('Value today')}</Today>
              {singleAddress ? <AddressWorth addressHash={addressHash} /> : <WalletWorth />}
            </BalancesColumn>
          </BalancesRow>
        </Balances>
        {children && <ChildrenContainer>{children}</ChildrenContainer>}
      </Panel>
    </WorthOverviewPanelStyled>
  )
}

export default WorthOverviewPanel

const WorthOverviewPanelStyled = styled(Box)`
  position: relative;
  overflow: hidden;
`

const Panel = styled.div`
  position: relative;
  display: flex;
  gap: 40px;
  align-items: center;
  padding: 50px;
  overflow: visible;
`

const Balances = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
`

const BalancesRow = styled.div`
  display: flex;
`

const ChildrenContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const BalancesColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  min-width: 200px;
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 18px;
  margin-bottom: 4px;
  text-align: center;
`