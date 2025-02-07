import { motion, MotionProps } from 'framer-motion'
import styled from 'styled-components'

import AppHeader from '@/components/AppHeader'
import ScrollbarCustom from '@/components/Scrollbar'

interface LockedWalletLayoutProps extends MotionProps {
  className?: string
}

const LockedWalletLayout: FC<LockedWalletLayoutProps> = ({ children, ...props }) => (
  <motion.main {...props}>
    <ScrollbarCustom>
      <AppHeader position="fixed" />
      <CenteredContainer>{children}</CenteredContainer>
    </ScrollbarCustom>
  </motion.main>
)

export default styled(LockedWalletLayout)`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background2};
`

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 100%;
`
