import { HTMLMotionProps, motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { deviceBreakPoints } from '@/styles/globalStyles'

export interface CardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  label?: string
  isLoading?: boolean
  className?: string
}

const Card = ({ label, children, isLoading, ...props }: CardProps) => (
  <Container initial={false} {...props}>
    {label && (
      <header>
        <LabelText>{label}</LabelText>
      </header>
    )}
    {isLoading ? <SkeletonLoader height="150px" /> : <Content>{children}</Content>}
  </Container>
)

export default Card

const Container = styled(motion.div)`
  flex: 1;
  position: relative;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  display: flex;
  flex-direction: column;
  gap: 25%;
  height: 155px;
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
