import { motion, MotionProps } from 'framer-motion'
import styled from 'styled-components'

import AnimatedBackground from '@/components/AnimatedBackground'
import AppHeader from '@/components/AppHeader'
import ScrollbarCustom from '@/components/Scrollbar'

interface LockedWalletLayoutProps extends MotionProps {
  className?: string
}

const LockedWalletLayout: FC<LockedWalletLayoutProps> = ({ children, ...props }) => (
  <>
    <AnimatedBackgroundStyled />
    <motion.main {...props}>
      <ScrollbarCustom>
        <AppHeader position="fixed" />
        <CenteredContainer>{children}</CenteredContainer>
      </ScrollbarCustom>
    </motion.main>
  </>
)

export default styled(LockedWalletLayout)`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background1};
`

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 100%;
`

const AnimatedBackgroundStyled = styled(AnimatedBackground)`
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
`
