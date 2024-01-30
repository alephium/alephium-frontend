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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import NakedChart, { NakedChartProps } from '../Charts/NakedChart'
import Card, { CardProps } from './Card'

interface CardWithChartProps extends CardProps {
  chartSeries: NakedChartProps['series']
  chartColors: NakedChartProps['colors']
  isLoading: boolean
}

const CardWithChart = ({ chartSeries, chartColors, children, ...props }: CardWithChartProps) => {
  const { t } = useTranslation()
  return (
    <StyledClickableCard {...props}>
      <Content>{children}</Content>
      <CardChartContainer>
        <NakedChart series={chartSeries} colors={chartColors} />
      </CardChartContainer>
      <SeeMoreLink>
        {t('See more')} <StyledArrowRight>→</StyledArrowRight>
      </SeeMoreLink>
    </StyledClickableCard>
  )
}

export default CardWithChart

const Content = styled.div`
  position: absolute;
  z-index: 1;
`

const CardChartContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 15px;
  left: 0;
  opacity: 0.4;
  z-index: 0;
  height: 50%;

  // Safari only hack, forces chart to be rendered on the bottom
  @media not all and (min-resolution: 0.001dpcm) {
    @supports (-webkit-appearance: none) {
      bottom: 0;
    }
  }
`

const SeeMoreLink = styled.a`
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: ${({ theme }) => theme.font.secondary};
`

const StyledArrowRight = styled.span`
  display: none;
`

const StyledClickableCard = styled(Card)`
  &:hover {
    cursor: pointer;

    ${CardChartContainer} {
      opacity: 1;
    }

    ${SeeMoreLink} {
      color: ${({ theme }) => theme.font.primary};
    }

    ${StyledArrowRight} {
      display: initial;
    }
  }
`
