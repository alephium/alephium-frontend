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
      enabled: false
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
    crosshairs: {
      show: false
    }
  },
  tooltip: {
    enabled: true,
    x: {
      show: true,
      format: 'dd MMM'
    },
    y: {
      formatter: undefined,
      title: {
        formatter: (seriesName) => seriesName
      }
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
    colors: [chartColor],
    width: 1
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
