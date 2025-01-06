import { createAction } from '@reduxjs/toolkit'

import { ChartLength } from '@/features/historicChart/historicChartTypes'

export const chartLengthChanged = createAction<ChartLength>('historicWorthChart/chartLengthChanged')
