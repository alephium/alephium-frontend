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

import { addApostrophes } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageVisibility } from 'react-page-visibility'
import styled, { css } from 'styled-components'

import Card from '@/components/Cards/Card'
import CardWithChart from '@/components/Cards/CardWithChart'
import FullScreenCard from '@/components/Cards/FullScreenCard'
import StatisticTextual from '@/components/Cards/StatisticTextual'
import LineAreaChart from '@/components/Charts/LineAreaChart'
import Counter from '@/components/Counter'
import PageSwitch from '@/components/PageSwitch'
import SearchBar from '@/components/SearchBar'
import Section from '@/components/Section'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import Waves from '@/components/Wave/Waves'
import useInterval from '@/hooks/useInterval'
import usePageNumber from '@/hooks/usePageNumber'
import { useWindowSize } from '@/hooks/useWindowSize'
import { deviceBreakPoints, deviceSizes } from '@/styles/globalStyles'
import { formatNumberForDisplay } from '@/utils/strings'

import useBlockListData from './useBlockListData'
import useStatisticsData from './useStatisticsData'

dayjs.extend(duration)

type VectorStatisticsKey = keyof ReturnType<typeof useStatisticsData>['data']['vector']

const HomePage = () => {
  const { t } = useTranslation()
  const { width } = useWindowSize()
  const isAppVisible = usePageVisibility()
  const currentPageNumber = usePageNumber()

  const [detailsCardOpen, setDetailsCardOpen] = useState<VectorStatisticsKey>()

  const [timeInterval, setTimeInterval] = useState(explorer.IntervalType.Daily)

  const {
    getBlocks,
    blockPageLoading,
    data: { blockList }
  } = useBlockListData(currentPageNumber)

  const {
    fetchStatistics,
    data: {
      scalar: { hashrate, totalSupply, circulatingSupply, totalTransactions, totalBlocks, avgBlockTime },
      vector
    }
  } = useStatisticsData(timeInterval)

  const vectorData = vector

  // Polling
  useInterval(
    () => {
      fetchStatistics()

      if (currentPageNumber === 1) {
        getBlocks(currentPageNumber, false)
      }
    },
    10 * 1000,
    !isAppVisible
  )

  const [hashrateInteger, hashrateDecimal, hashrateSuffix] = formatNumberForDisplay(hashrate.value, '', 'hash')

  const currentSupplyPercentage =
    circulatingSupply.value && totalSupply.value && ((circulatingSupply.value / totalSupply.value) * 100).toPrecision(3)

  const fullScreenCardLabels: Record<VectorStatisticsKey, string> = {
    txVector: `${t('Transactions per')} ${timeInterval === explorer.IntervalType.Daily ? t('day') : t('hour')}`,
    hashrateVector: `${t('Hashrate per')} ${timeInterval === explorer.IntervalType.Daily ? t('day') : t('hour')}`
  }

  return (
    <StyledSection>
      {width && width > deviceSizes.mobile && (
        <Search>
          <h2>{t('Search')}</h2>
          <SearchBar />
        </Search>
      )}
      <MainContent>
        <StatisticsSection>
          <StatisticsHeader>
            <h2>{t('Our numbers')}</h2>
            <TimeIntervalSwitch>
              <TimeIntervalButton
                isSelected={timeInterval === explorer.IntervalType.Daily}
                onClick={() => setTimeInterval(explorer.IntervalType.Daily)}
              >
                {t('Daily')}
              </TimeIntervalButton>
              <TimeIntervalButton
                isSelected={timeInterval === explorer.IntervalType.Hourly}
                onClick={() => setTimeInterval(explorer.IntervalType.Hourly)}
              >
                {t('Hourly')}
              </TimeIntervalButton>
            </TimeIntervalSwitch>
          </StatisticsHeader>
          <StatisticsContainer>
            <CardWithChart
              label={t('Transactions')}
              chartSeries={vectorData.txVector.value.series}
              chartColors={['#16cbf4', '#8a46ff']}
              isLoading={totalTransactions.isLoading}
              onClick={() => setDetailsCardOpen('txVector')}
              layoutId={`expandableCard-${'txVector' as VectorStatisticsKey}`}
            >
              <StatisticTextual
                primary={totalTransactions.value ? <Counter to={totalTransactions.value} /> : '-'}
                secondary={t('Total')}
              />
            </CardWithChart>
            <CardWithChart
              chartSeries={vectorData.hashrateVector.value.series}
              chartColors={['#b116f4', '#ff904c']}
              label={t('Hashrate')}
              isLoading={hashrate.isLoading}
              onClick={() => setDetailsCardOpen('hashrateVector')}
              layoutId={`expandableCard-${'hashrateVector' as VectorStatisticsKey}`}
            >
              <StatisticTextual
                primary={hashrateInteger ? addApostrophes(hashrateInteger) + (hashrateDecimal ?? '') : '-'}
                secondary={`${hashrateSuffix}H/s`}
              />
            </CardWithChart>
            <Card label={t('Supply')} isLoading={circulatingSupply.isLoading || totalSupply.isLoading}>
              <StatisticTextual
                primary={
                  <>
                    <span>{circulatingSupply.value ? formatNumberForDisplay(circulatingSupply.value, '') : '-'}</span>
                    <TextSecondary> / </TextSecondary>
                    <TextSecondary>
                      {totalSupply.value ? formatNumberForDisplay(totalSupply.value, '') : '-'}
                    </TextSecondary>
                  </>
                }
                secondary={
                  currentSupplyPercentage ? (
                    <>
                      <TextPrimary>{currentSupplyPercentage}%</TextPrimary> {t('is circulating')}
                    </>
                  ) : null
                }
              />
            </Card>
            <Card label={t('Blocks')} isLoading={totalBlocks.isLoading}>
              <StatisticTextual
                primary={totalBlocks.value ? <Counter to={totalBlocks.value} /> : '-'}
                secondary={t('Total')}
              />
            </Card>
            <Card label={t('Avg. block time')} isLoading={avgBlockTime.isLoading}>
              <StatisticTextual
                primary={avgBlockTime.value ? dayjs.duration(avgBlockTime.value).format('m[m] s[s]') : '-'}
                secondary={t('of all shards')}
              />
            </Card>
          </StatisticsContainer>
        </StatisticsSection>
        <LatestsBlocks>
          <h2>{t('Latest Blocks')}</h2>
          <Content>
            <BlockListTable main isLoading={blockPageLoading} minHeight={498}>
              <TableHeader
                headerTitles={['Height', 'Timestamp', 'Txn', 'Chain index']}
                columnWidths={['20%', '30%', '20%', '25%']}
              />
              <TableBody tdStyles={TableBodyCustomStyles}>
                {blockList &&
                  blockList.blocks?.map((b) => (
                    <TableRow key={b.hash} linkTo={`blocks/${b.hash}`}>
                      <BlockHeight>{b.height.toString()}</BlockHeight>
                      <Timestamp
                        timeInMs={b.timestamp}
                        customFormat={
                          dayjs(b.timestamp).date() !== dayjs().date() ? 'HH:mm:ss (DD/MM/YYYY)' : 'HH:mm:ss'
                        }
                      />
                      <span>{b.txNumber}</span>
                      <span>
                        {b.chainFrom} → {b.chainTo}
                      </span>
                    </TableRow>
                  ))}
              </TableBody>
            </BlockListTable>
          </Content>
          {blockList?.total && <PageSwitch totalNumberOfElements={blockList.total} elementsPerPage={8} />}
        </LatestsBlocks>
      </MainContent>
      <Waves />
      <AnimatePresence initial={false}>
        {detailsCardOpen && (
          <FullScreenCard
            layoutId={`expandableCard-${detailsCardOpen}`}
            label={fullScreenCardLabels[detailsCardOpen]}
            key={detailsCardOpen}
            onClose={() => setDetailsCardOpen(undefined)}
          >
            <LineAreaChart
              series={vectorData[detailsCardOpen].value.series}
              categories={vectorData[detailsCardOpen].value.categories}
              colors={chartColors[detailsCardOpen]}
              xAxisType="datetime"
              yAxisType="formatted"
              timeInterval={timeInterval}
              unit={detailsCardOpen === 'hashrateVector' ? 'H/s' : ''}
            />
          </FullScreenCard>
        )}
      </AnimatePresence>
    </StyledSection>
  )
}

const chartColors: Record<VectorStatisticsKey, [string, string]> = {
  txVector: ['#16cbf4', '#8a46ff'],
  hashrateVector: ['#b116f4', '#ff904c']
}

export default HomePage

const StyledSection = styled(Section)`
  margin-top: -30px;
`

const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-self: center;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    gap: 30px;
  }
`

const Search = styled.div`
  margin: -35px auto 7vh auto;
  width: 60%;
`

const StatisticsSection = styled.div`
  flex: 1;
  min-width: 300px;
`

const StatisticsHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  margin-top: 18px;

  h2 {
    margin: 0;
  }
`

const TimeIntervalSwitch = styled.div`
  display: flex;
  gap: 10px;
`

const TimeIntervalButton = styled.button<{ isSelected: boolean }>`
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.font.secondary};

  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 1px solid ${({ theme }) => theme.font.secondary};
      color: ${({ theme }) => theme.font.primary};
    `}

  &:hover {
    border: 1px solid ${({ theme }) => theme.font.primary};
  }
`

const StatisticsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  div:nth-child(1) {
    grid-column-end: span 2;
    grid-row: 1;
  }

  @media ${deviceBreakPoints.mobile} {
    gap: 15px;
  }

  @media ${deviceBreakPoints.tiny} {
    display: flex;
    flex-direction: column;
  }
`

const TextPrimary = styled.span`
  color: ${({ theme }) => theme.font.primary};
`

const TextSecondary = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.75em;

  @media ${deviceBreakPoints.mobile} {
    gap: 20px;
    font-size: 0.5em;
  }
`

const LatestsBlocks = styled.div`
  flex: 1;
  min-width: 300px;
`

const Content = styled.div``

const BlockListTable = styled(Table)`
  height: 498px;
`

const BlockHeight = styled.span`
  color: ${({ theme }) => theme.global.highlight};
`

const TableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 4,
    style: css`
      font-feature-settings: 'tnum';
      font-weight: 600;
    `
  }
]
