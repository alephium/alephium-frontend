import { ReactNode } from 'react'
import styled from 'styled-components'

import Badge from '@/components/Badge'
import LoadingSpinner from '@/components/LoadingSpinner'
import { deviceBreakPoints } from '@/styles/globalStyles'

interface PageTitleProps {
  title: ReactNode
  surtitle?: string | ReactNode
  subtitle?: string | ReactNode
  isLoading?: boolean
  badge?: string
  badgeType?: 'accent' | 'neutral' | 'plus' | 'minus' | 'neutralHighlight'
}

const SectionTitle = ({ title, surtitle, badge, subtitle, isLoading, badgeType = 'accent' }: PageTitleProps) => (
  <TitleWrapper>
    {surtitle && <Surtitle>{surtitle}</Surtitle>}
    <TitleRow>
      <Title>{title}</Title>
      {badge && <Badge type={badgeType} content={badge} />}
      {isLoading && <LoadingSpinner size={18} />}
    </TitleRow>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </TitleWrapper>
)

const TitleWrapper = styled.div`
  margin-bottom: 10px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Title = styled.h1`
  font-weight: bold;
  font-size: 2.1rem;
  color: ${({ theme }) => theme.font.primary};
  font-weight: 600;
  display: flex;
  gap: 14px;

  @media ${deviceBreakPoints.mobile} {
    font-size: 2rem;
    margin-top: 20px;
  }
`

const Surtitle = styled.h2`
  font-weight: 500;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 0;
  overflow: hidden;
`

const Subtitle = styled.h2`
  font-weight: 500;
  font-size: 1.6rem;
  color: ${({ theme }) => theme.font.secondary};
  margin: 0;
  margin-bottom: 20px;
`

export const SecondaryTitle = styled.h2`
  margin-top: 50px;
  margin-bottom: 25px;
`

export default SectionTitle
