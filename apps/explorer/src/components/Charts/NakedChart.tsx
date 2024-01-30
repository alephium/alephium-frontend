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

import Chart from 'react-apexcharts'

export interface NakedChartProps {
  series: number[]
  colors: [string, string]
}

const NakedChart = ({ series, colors }: NakedChartProps) => (
  <Chart options={getChartOptions(colors)} series={[{ data: series }]} type="area" height="100%" />
)

const getChartOptions = (colors: [string, string]): ApexCharts.ApexOptions => ({
  chart: {
    offsetY: 15,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: true
    }
  },
  xaxis: {
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
    show: false
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
            color: colors[0],
            opacity: 1
          },
          {
            offset: 100,
            color: colors[1],
            opacity: 1
          }
        ]
      ]
    }
  },
  tooltip: {
    enabled: false
  },
  legend: {
    show: false
  }
})

export default NakedChart
