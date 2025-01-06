import { motion, MotionProps } from 'framer-motion'
import styled from 'styled-components'

import SideBar from '@/components/PageComponents/SideBar'
import Scrollbar from '@/components/Scrollbar'
import { ReactComponent as AlephiumLogotype } from '@/images/logotype.svg'

interface LockedWalletLayoutProps extends MotionProps {
  className?: string
  animateSideBar?: boolean
}

const LockedWalletLayout: FC<LockedWalletLayoutProps> = ({ children, animateSideBar, ...props }) => (
  <motion.main {...props}>
    <SideBar animateEntry={animateSideBar}>
      <Logo>
        <AlephiumLogotypeStyled />
      </Logo>
    </SideBar>
    <Scrollbar>
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

const Logo = styled.div`
  padding: 5px;
`

const AlephiumLogotypeStyled = styled(AlephiumLogotype)`
  fill: ${({ theme }) => theme.font.primary};
  color: ${({ theme }) => theme.font.primary};
`

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 100%;
`
