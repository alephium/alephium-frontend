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
