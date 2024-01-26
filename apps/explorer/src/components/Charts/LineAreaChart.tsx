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

import { explorer } from '@alephium/web3'
import { colord } from 'colord'
import dayjs from 'dayjs'
import Chart from 'react-apexcharts'
import { useTheme } from 'styled-components'

import { formatXAxis, formatYAxis, XAxisType, YAxisType } from '@/utils/charts'

type TooltipStyleArgs = {
  series: number[][]
  seriesIndex: number
  dataPointIndex: number
}

interface LineAreaChartProps {
  series: number[]
  categories: (number | string)[]
  colors: [string, string]
  yAxisType: YAxisType
  xAxisType: XAxisType
  timeInterval: explorer.IntervalType
  unit: string
}

const LineAreaChart = ({
  series,
  categories,
  colors,
  xAxisType,
  yAxisType,
  timeInterval,
  unit
}: LineAreaChartProps) => {
  const theme = useTheme()

  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      },
      zoom: {
        enabled: false
      }
    },
    xaxis: {
      categories,
      axisTicks: {
        color: theme.border.secondary
      },
      axisBorder: {
        show: false
      },
      labels: {
        style: {
          colors: theme.font.secondary
        },
        formatter: formatXAxis(xAxisType, timeInterval)
      },
      tooltip: {
        enabled: false
      },
      crosshairs: {
        show: true,
        position: 'front',
        stroke: {
          color: theme.border.primary,
          width: 1,
          dashArray: 6
        }
      }
    },
    yaxis: {
      floating: true,
      labels: {
        style: {
          colors: theme.font.secondary,
          fontSize: '12px'
        },
        offsetY: -10,
        offsetX: 50,
        formatter: formatYAxis(yAxisType, unit),
        align: 'left'
      }
    },
    grid: {
      borderColor: colord(theme.border.primary).alpha(0.5).toHex(),
      padding: {
        top: 0,
        right: 0
      },
      strokeDashArray: 5,
      position: 'front'
    },
    markers: {
      colors: theme.bg.primary
    },
    tooltip: {
      theme: false as unknown as string,
      custom({ series, seriesIndex, dataPointIndex }: TooltipStyleArgs) {
        return `<div style="
          color: ${theme.font.primary};
          background-color: ${theme.bg.primary};
          min-width: 121px;
        ">
          <div style="display: flex; flex-direction: column;">
            <div style="
              background-color: ${theme.bg.secondary};
              padding: 9px 0px 5px 11px;
              border-bottom: 1px solid ${theme.border.secondary};
            ">
              ${
                timeInterval === explorer.IntervalType.Daily
                  ? dayjs(new Date(categories[dataPointIndex])).format('DD/MM/YYYY')
                  : dayjs(categories[dataPointIndex]).format('ddd, hh:ss')
              }
            </div>
            <div style="
              padding: 10px 0px 11px 11px;
              font-weight: 700;
            ">
              ${formatYAxis(yAxisType, unit)(series[seriesIndex][dataPointIndex])}
            </div>
          </div>
        </div>`
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        colorStops: [
          [
            {
              offset: 0,
              color: colors[0],
              opacity: 0.8
            },
            {
              offset: 100,
              color: colors[1],
              opacity: 0.8
            }
          ]
        ]
      }
    }
  }

  return <Chart height="100%" width="100%" options={options} series={[{ data: series }]} type="area" />
}

export default LineAreaChart
