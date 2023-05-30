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

import { Defs, LinearGradient, Stop, Svg } from 'react-native-svg'
import styled, { useTheme } from 'styled-components/native'
import { VictoryArea } from 'victory-native'

const HistoricWorthChart = () => {
  const theme = useTheme()

  const data = [
    { x: 1, y: 0 },
    { x: 2, y: 10 },
    { x: 3, y: 8 },
    { x: 4, y: 58 },
    { x: 5, y: 56 },
    { x: 6, y: 78 },
    { x: 7, y: 74 },
    { x: 8, y: 98 },
    { x: 9, y: 98 },
    { x: 10, y: 98 }
  ]

  const maxY = Math.max(...data.map(({ y }) => y))

  return (
    <HistoricWorthChartStyled>
      <Svg height={100}>
        <Defs>
          <LinearGradient id="gradientBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={theme.global.valid} />
            <Stop offset="100%" stopColor={theme.bg.back1} />
          </LinearGradient>
        </Defs>
        <VictoryArea
          data={data}
          interpolation="natural"
          height={100}
          padding={0}
          standalone={false}
          maxDomain={{
            y: maxY + 5
          }}
          style={{
            data: {
              fill: 'url(#gradientBg)',
              stroke: theme.global.valid,
              strokeWidth: 3,
              fillOpacity: 0.4
            }
          }}
        />
      </Svg>
    </HistoricWorthChartStyled>
  )
}

export default HistoricWorthChart

const HistoricWorthChartStyled = styled.View``
