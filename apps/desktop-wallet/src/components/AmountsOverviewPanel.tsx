import dayjs from 'dayjs'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TotalAlphBalance from '@/features/balancesOverview/TotalAlphBalance'
import ChartLengthBadges from '@/features/historicChart/ChartLengthBadges'
import FiatDeltaPercentage from '@/features/historicChart/FiatDeltaPercentage'
import { DataPoint } from '@/features/historicChart/historicChartTypes'
import HistoricWorthChart from '@/features/historicChart/HistoricWorthChart'
import AddressWorth from '@/modals/AddressDetailsModal/AddressWorth'
import WalletWorth from '@/pages/UnlockedWallet/OverviewPage/WalletWorth'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'

interface AmountsOverviewPanelProps {
  addressHash?: string
  isLoading?: boolean
  className?: string
  chartVisible?: boolean
  chartInitiallyHidden?: boolean
  animateChartEntry?: boolean
  children?: ReactNode
}

const AmountsOverviewPanel = ({
  className,
  addressHash,
  children,
  chartVisible,
  chartInitiallyHidden
}: AmountsOverviewPanelProps) => {
  const { t } = useTranslation()

  const [hoveredDataPoint, setHoveredDataPoint] = useState<DataPoint>()
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const hoveredDataPointDate = hoveredDataPoint ? dayjs(hoveredDataPoint.date).format('DD/MM/YYYY') : undefined
  const hoveredDataPointWorth = hoveredDataPoint?.worth

  const singleAddress = !!addressHash
  const isHoveringChart = hoveredDataPointWorth !== undefined

  return (
    <UnlockedWalletPanelStyled className={className}>
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

              {isHoveringChart && (
                <Opacity>
                  <FiatDeltaPercentage
                    worthInBeginningOfChart={worthInBeginningOfChart}
                    hoveredDataPointWorth={hoveredDataPointWorth}
                  />
                </Opacity>
              )}

              <ChartLengthBadges />
            </BalancesColumn>

            {!singleAddress && (
              <>
                <Divider />
                <AvailableLockedBalancesColumn fadeOut={isHoveringChart}>
                  <TotalAlphBalance type="available" />
                  <TotalAlphBalance type="locked" />
                </AvailableLockedBalancesColumn>
              </>
            )}
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
    </UnlockedWalletPanelStyled>
  )
}

export default AmountsOverviewPanel

const UnlockedWalletPanelStyled = styled(UnlockedWalletPanel)`
  position: relative;
  padding: 0;
`

const Panel = styled.div`
  position: relative;
  display: flex;
  gap: 30px;
  align-items: center;

  padding: 40px 60px 0;
`

const Balances = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
`

const BalancesRow = styled.div`
  display: flex;
  padding: 0 6%;
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
  min-width: 200px;
`

const AvailableLockedBalancesColumn = styled(BalancesColumn)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  margin: 17px 55px;
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 16px;
  margin-bottom: 8px;
`
