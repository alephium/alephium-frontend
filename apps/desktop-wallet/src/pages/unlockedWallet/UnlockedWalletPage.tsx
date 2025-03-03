import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { UnlockedWalletPanel } from '@/pages/unlockedWallet/UnlockedWalletLayout'

interface UnlockedWalletPageProps extends MotionProps {
  title?: string
  subtitle?: string
  BottomComponent?: ReactNode
  className?: string
}

const UnlockedWalletPage: FC<UnlockedWalletPageProps> = ({ title, subtitle, BottomComponent, children, ...props }) => (
  <motion.div {...fadeIn} {...props}>
    {(title || subtitle) && (
      <PageHeader>
        <TitleContainer style={{ marginBottom: BottomComponent ? 0 : 35 }}>
          {title && <PageTitle>{title}</PageTitle>}
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </TitleContainer>
        {BottomComponent}
      </PageHeader>
    )}
    {children}
  </motion.div>
)

export default styled(UnlockedWalletPage)`
  background-color: ${({ theme }) => theme.bg.background1};
`

const PageHeader = styled(UnlockedWalletPanel)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
`

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const PageTitle = styled.h1`
  font-size: 28px;
  line-height: 36px;
  font-weight: var(--fontWeight-bold);
  margin-top: 0;
  margin-bottom: 10px;
`

const PageSubtitle = styled.div`
  max-width: 400px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
