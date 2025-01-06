import { colord } from 'colord'

import { DataPoint } from '@/features/historicChart/historicChartTypes'

export const getFilteredChartData = (chartData: DataPoint[], startingDate: string) => {
  const startingPoint = chartData.findIndex((point) => point.date === startingDate)
  return startingPoint > 0 ? chartData.slice(startingPoint) : chartData
}

export const getChartOptions = (
  chartColor: string,
  xAxisData: string[],
  events: ApexChart['events']
): ApexCharts.ApexOptions => ({
  chart: {
    id: 'alephium-chart',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: true
    },
    events,
    animations: {
      enabled: false,
      easing: 'easeout',
      speed: 500,
      dynamicAnimation: {
        enabled: false
      }
    }
  },
  xaxis: {
    type: 'datetime',
    categories: xAxisData,
    axisTicks: {
      show: false
    },
    axisBorder: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    labels: {
      show: false
    },
    crosshairs: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0
    }
  },
  stroke: {
    curve: 'smooth',
    colors: [chartColor],
    width: 2
  },
  tooltip: {
    custom: () => null,
    fixed: {
      enabled: true
    }
  },
  markers: {
    colors: [chartColor],
    strokeColors: [chartColor],
    hover: {
      size: 4
    }
  },
  dataLabels: {
    enabled: false
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
            color: colord(chartColor).alpha(0.3).toHex(),
            opacity: 1
          },
          {
            offset: 100,
            color: colord(chartColor).alpha(0).toHex(),
            opacity: 1
          }
        ]
      ]
    }
  }
})
