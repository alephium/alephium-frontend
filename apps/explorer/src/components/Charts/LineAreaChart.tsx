import { explorer } from '@alephium/web3'
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
      offsetY: 15,
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
      borderColor: theme.border.primary,
      padding: {
        top: 0,
        right: 0
      },
      strokeDashArray: 5,
      position: 'front'
    },
    markers: {
      colors: colors[0]
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
      show: true,
      curve: 'smooth',
      width: 2,
      colors: [colors[0]]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        colorStops: [
          [
            {
              offset: 0,
              color: colors[0],
              opacity: 0.2
            },
            {
              offset: 100,
              color: colors[0],
              opacity: 0
            }
          ]
        ]
      }
    }
  }

  return <Chart height="100%" width="100%" options={options} series={[{ data: series }]} type="area" />
}

export default LineAreaChart
