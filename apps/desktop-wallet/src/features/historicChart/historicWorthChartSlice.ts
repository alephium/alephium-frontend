import { createSlice } from '@reduxjs/toolkit'

import { ChartLength } from '@/features/historicChart/historicChartTypes'
import { chartLengthChanged } from '@/features/historicChart/historicWorthChartActions'

interface HistoricWorthChartState {
  chartLength: ChartLength
}

const initialState: HistoricWorthChartState = {
  chartLength: '1m'
}

const historicWorthChartSlice = createSlice({
  name: 'historicWorthChart',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(chartLengthChanged, (state, { payload: chartLength }) => {
      state.chartLength = chartLength
    })
  }
})

export default historicWorthChartSlice
