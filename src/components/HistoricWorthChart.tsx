/*
Copyright 2018 - 2022 The Alephium Authors
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

import { useWindowDimensions } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import styled, { useTheme } from 'styled-components/native'

const HistoricWorthChart = () => {
  const { width } = useWindowDimensions()
  const theme = useTheme()

  const lineData = [
    { value: 0 },
    { value: 10 },
    { value: 8 },
    { value: 58 },
    { value: 56 },
    { value: 78 },
    { value: 74 },
    { value: 98 },
    { value: 98 },
    { value: 98 }
  ]

  return (
    <HistoricWorthChartStyled>
      <LineChart
        areaChart
        curved
        data={lineData}
        height={100}
        width={width}
        hideRules
        hideYAxisText
        adjustToWidth
        disableScroll
        initialSpacing={0}
        thickness={2}
        color={theme.global.valid}
        hideDataPoints
        dataPointsColor={theme.global.valid}
        startFillColor={theme.global.valid}
        startOpacity={0.8}
        endOpacity={0.3}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisLabelWidth={0}
      />
    </HistoricWorthChartStyled>
  )
}

export default HistoricWorthChart

const HistoricWorthChartStyled = styled.View``
