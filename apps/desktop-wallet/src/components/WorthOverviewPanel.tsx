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

import dayjs from 'dayjs'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import Box from '@/components/Box'
import ChartLengthBadges from '@/features/historicChart/ChartLengthBadges'
import { DataPoint } from '@/features/historicChart/historicChartTypes'
import HistoricWorthChart from '@/features/historicChart/HistoricWorthChart'
import AddressWorth from '@/modals/AddressDetailsModal/AddressWorth'
import WalletWorth from '@/pages/UnlockedWallet/OverviewPage/WalletWorth'

interface WorthOverviewPanelProps {
  addressHash?: string
  isLoading?: boolean
  className?: string
  chartVisible?: boolean
  chartInitiallyHidden?: boolean
  animateChartEntry?: boolean
  children?: ReactNode
}

const WorthOverviewPanel = ({
  className,
  addressHash,
  children,
  chartVisible,
  chartInitiallyHidden
}: WorthOverviewPanelProps) => {
  const { t } = useTranslation()

  const [hoveredDataPoint, setHoveredDataPoint] = useState<DataPoint>()
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const hoveredDataPointDate = hoveredDataPoint ? dayjs(hoveredDataPoint.date).format('DD/MM/YYYY') : undefined
  const hoveredDataPointWorth = hoveredDataPoint?.worth

  const singleAddress = !!addressHash
  const isHoveringChart = hoveredDataPointWorth !== undefined

  return (
    <WorthOverviewPanelStyled className={className}>
      <AnimatedBackground height={600} />
      <Panel>
        <Balances>
          <BalancesRow>
            <BalancesColumn>
              <Today>{!hoveredDataPointDate ? t('Value today') : `${hoveredDataPointDate} (${t('ALPH only')})`}</Today>

              {singleAddress ? (
                <AddressWorth overrideWorth={hoveredDataPointWorth} addressHash={addressHash} />
              ) : (
                <WalletWorth overrideWorth={hoveredDataPointWorth} />
              )}
            </BalancesColumn>
          </BalancesRow>
        </Balances>
        {children && <RightColumnContent fadeOut={isHoveringChart}>{children}</RightColumnContent>}
      </Panel>

      <HistoricWorthChart
        addressHash={addressHash}
        onDataPointHover={setHoveredDataPoint}
        onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
        chartVisible={chartVisible}
        chartInitiallyHidden={chartInitiallyHidden}
      />
      <ChartLengthsContainer>
        <ChartLengthBadges />
      </ChartLengthsContainer>
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
  flex-direction: column;
  gap: 30px;
  align-items: center;
  padding: 40px 60px 0;
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

const Opacity = styled.div<{ fadeOut?: boolean }>`
  transition: opacity 0.2s ease-out;
  opacity: ${({ fadeOut }) => (fadeOut ? 0.23 : 1)};
`

const RightColumnContent = styled(Opacity)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const BalancesColumn = styled(Opacity)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 200px;
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  margin-bottom: 8px;
  text-align: center;
`

const FiatDeltaOpacityContainer = styled(Opacity)`
  height: 5px;
`

const ChartLengthsContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`
