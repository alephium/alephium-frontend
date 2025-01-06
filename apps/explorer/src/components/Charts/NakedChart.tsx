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
