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

import { HTMLMotionProps, motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { blurredBackground, deviceBreakPoints } from '@/styles/globalStyles'

export interface CardProps extends HTMLMotionProps<'div'> {
  label: string
  isLoading: boolean
  children: ReactNode
  className?: string
}

const Card = ({ label, children, isLoading, ...props }: CardProps) => (
  <Container initial={false} {...props}>
    <header>
      <LabelText>{label}</LabelText>
    </header>
    {isLoading ? <SkeletonLoader height="150px" /> : <Content>{children}</Content>}
  </Container>
)

export default Card

const Container = styled(motion.div)`
  flex: 1;
  position: relative;
  ${({ theme }) => blurredBackground(theme.bg.primary)};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  gap: 25%;
  height: 150px;
  padding: 20px;
  overflow: hidden;

  @media ${deviceBreakPoints.mobile} {
    height: 100px;
    min-height: 100px;
    padding-top: 12px;
    gap: 10px;
  }
`

const LabelText = styled.span`
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
`

const Content = styled.div``
