import { motion, MotionProps } from 'framer-motion'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { appHeaderHeightPx } from '@/style/globalStyles'

interface UnlockedWalletPageProps extends MotionProps {
  title?: string
  subtitle?: string
  className?: string
}

const UnlockedWalletPage: FC<UnlockedWalletPageProps> = ({ title, subtitle, children, ...props }) => (
  <motion.div {...fadeIn} {...props}>
    {(title || subtitle) && (
      <PageHeader>
        <div>
          {title && <PageTitle>{title}</PageTitle>}
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </div>
      </PageHeader>
    )}
    {children}
  </motion.div>
)

export default styled(UnlockedWalletPage)`
  background-color: ${({ theme }) => theme.bg.background2};
  padding-top: ${appHeaderHeightPx}px;
`

const PageHeader = styled(UnlockedWalletPanel)`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-top: 35px;
  margin-bottom: 50px;
  margin-left: var(--spacing-4);
`

const PageTitle = styled.h1`
  font-size: 34px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 0;
  margin-bottom: 20px;
`

const PageSubtitle = styled.div`
  max-width: 400px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
