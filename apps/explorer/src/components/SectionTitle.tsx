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

import { ReactNode } from 'react'
import styled from 'styled-components'

import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { deviceBreakPoints } from '@/styles/globalStyles'

interface PageTitleProps {
  title: ReactNode
  surtitle?: string | JSX.Element
  subtitle?: string | JSX.Element
  isLoading?: boolean
  badge?: string
}

const SectionTitle = ({ title, surtitle, badge, subtitle, isLoading }: PageTitleProps) => (
  <TitleWrapper>
    {surtitle && <Surtitle>{surtitle}</Surtitle>}
    <TitleRow>
      <Title>{title}</Title>
      {badge && <Badge type="accent" content={badge} />}
      {isLoading && <LoadingSpinner size={18} />}
    </TitleRow>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </TitleWrapper>
)

const TitleWrapper = styled.div`
  margin-bottom: 25px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Title = styled.h1`
  font-family: 'Inter';
  font-weight: bold;
  font-size: 2.1rem;
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  display: flex;

  @media ${deviceBreakPoints.mobile} {
    font-size: 2rem;
    margin-top: 20px;
  }
`

const Surtitle = styled.h2`
  font-family: 'Inter';
  font-weight: 500;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 0;
  overflow: hidden;
`

const Subtitle = styled.h2`
  font-family: 'Inter';
  font-weight: 500;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.font.secondary};
  margin: 0;
  margin-bottom: 35px;
`

export const SecondaryTitle = styled.h2`
  margin-top: 50px;
  margin-bottom: 25px;
`

export default SectionTitle
