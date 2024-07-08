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

import { AddressHash, calculateAmountWorth, CURRENCIES, selectAlphPrice } from '@alephium/shared'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesTotalWorth } from '@/api/apiHooks'
import Amount from '@/components/Amount'
import HistoricWorthChart, { historicWorthChartHeight } from '@/components/HistoricWorthChart'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { makeSelectAddresses, selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { ChartLength, DataPoint } from '@/types/chart'

interface AmountsOverviewPanelProps {
  addressHash?: string
  isLoading?: boolean
  className?: string
  showChart?: boolean
  animateChartEntry?: boolean
}

const chartAnimationVariants = {
  shown: { height: historicWorthChartHeight },
  hidden: { height: 0 }
}

const AmountsOverviewPanel: FC<AmountsOverviewPanelProps> = ({ className, addressHash, children, showChart }) => {
  const { t } = useTranslation()
  const allAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressHashes = addressHash ?? allAddressHashes
  const selectAddresses = useMemo(makeSelectAddresses, [])
  const addresses = useAppSelector((s) => selectAddresses(s, addressHashes))
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)

  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const alphPrice = useAppSelector(selectAlphPrice)

  const [hoveredDataPoint, setHoveredDataPoint] = useState<DataPoint>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chartLength, setChartLength] = useState<ChartLength>('1m')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const { date: hoveredDataPointDate, worth: hoveredDataPointWorth } = hoveredDataPoint ?? {
    date: undefined,
    worth: undefined
  }
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
  const totalAlphAmountWorth = alphPrice !== undefined ? calculateAmountWorth(totalBalance, alphPrice) : undefined

  const { data: totalAmountWorth } = useAddressesTotalWorth(allAddressHashes)

  const balanceInFiat = hoveredDataPointWorth ?? totalAmountWorth

  const isHoveringChart = !!hoveredDataPointWorth
  const showBalancesSkeletonLoader = false // TODO: Manage loading

  return (
    <UnlockedWalletPanelStyled className={className}>
      <Panel>
        <Balances>
          <BalancesRow>
            <BalancesColumn>
              <Today>
                {hoveredDataPointDate
                  ? dayjs(hoveredDataPointDate).format('DD/MM/YYYY') + ' (ALPH only)'
                  : t('Value today')}
              </Today>
              {showBalancesSkeletonLoader ? (
                <SkeletonLoader height="32px" style={{ marginBottom: 7, marginTop: 7 }} />
              ) : (
                <FiatTotalAmount tabIndex={0} value={balanceInFiat} isFiat suffix={CURRENCIES[fiatCurrency].symbol} />
              )}
              {hoveredDataPointWorth !== undefined && (
                <Opacity>
                  {/*
                    <FiatDeltaPercentage>
                      {!haveHistoricBalancesLoaded || (hasHistoricBalances && worthInBeginningOfChart === undefined) ? (
                        <SkeletonLoader height="18px" width="70px" style={{ marginBottom: 6 }} />
                      ) : hasHistoricBalances && worthInBeginningOfChart && hoveredDataPointWorth !== undefined ? (
                        <DeltaPercentage initialValue={worthInBeginningOfChart} latestValue={hoveredDataPointWorth} />
                      ) : null}
                    </FiatDeltaPercentage>
                    */}
                </Opacity>
              )}

              <ChartLengthBadges>
                {/*
                chartLengths.map((length) =>
                  !haveHistoricBalancesLoaded ? (
                    <SkeletonLoader
                      key={length}
                      height="25px"
                      width="30px"
                      style={{ marginTop: 6, marginBottom: 12 }}
                    />
                  ) : (
                    hasHistoricBalances && (
                      <ButtonStyled
                        key={length}
                        transparent
                        short
                        isActive={length === chartLength}
                        onClick={() => setChartLength(length)}
                      >
                        {length}
                      </ButtonStyled>
                    )
                  )
                )
                  */}
              </ChartLengthBadges>
            </BalancesColumn>
          </BalancesRow>
        </Balances>
        {children && <RightColumnContent fadeOut={isHoveringChart}>{children}</RightColumnContent>}
      </Panel>

      <ChartOuterContainer
        variants={chartAnimationVariants}
        animate={showChart && !discreetMode && totalAlphAmountWorth !== undefined ? 'shown' : 'hidden'}
      >
        <ChartInnerContainer animate={{ opacity: discreetMode ? 0 : 1 }} transition={{ duration: 0.5 }}>
          <HistoricWorthChart
            addressHash={addressHash}
            onDataPointHover={setHoveredDataPoint}
            onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
            latestWorth={totalAlphAmountWorth}
            length={chartLength}
          />
        </ChartInnerContainer>
      </ChartOuterContainer>
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

const FiatTotalAmount = styled(Amount)`
  font-size: 34px;
  font-weight: var(--fontWeight-bold);
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 16px;
  margin-bottom: 8px;
`

const ChartLengthBadges = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`

// const ButtonStyled = styled(Button)<{ isActive: boolean }>`
//   color: ${({ theme }) => theme.font.primary};
//   opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};
//   border-color: ${({ theme }) => theme.font.primary};
//   padding: 3px;
//   height: auto;
//   min-width: 32px;
//   border-radius: var(--radius-small);

//   &:hover {
//     border-color: ${({ theme }) => theme.font.tertiary};
//   }
// `

const ChartOuterContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  right: 0;
  left: 0;
  margin: var(--spacing-4) 0;

  overflow: hidden;
`

const ChartInnerContainer = styled(motion.div)`
  height: 100%;
  width: 100%;
`
