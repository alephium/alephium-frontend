import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import AppHeader from '@/components/AppHeader'
import Scrollbar from '@/components/Scrollbar'

interface LockedWalletLayoutProps extends MotionProps {
  className?: string
  children: ReactNode
}

const LockedWalletLayout = ({ children, ...props }: LockedWalletLayoutProps) => (
  <motion.main {...props}>
    <Scrollbar>
      <AppHeader position="fixed" />
      <CenteredContainer>{children}</CenteredContainer>
    </Scrollbar>
  </motion.main>
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
