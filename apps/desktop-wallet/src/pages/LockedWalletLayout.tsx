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

import { motion, MotionProps } from 'framer-motion'
import styled from 'styled-components'

import AppHeader from '@/components/AppHeader'
import SideBar from '@/components/PageComponents/SideBar'
import ScrollbarCustom from '@/components/Scrollbar'
import { ReactComponent as AlephiumLogotype } from '@/images/logotype.svg'

interface LockedWalletLayoutProps extends MotionProps {
  className?: string
}

const LockedWalletLayout: FC<LockedWalletLayoutProps> = ({ children, ...props }) => (
  <motion.main {...props}>
    <SideBar noExpansion></SideBar>
    <ScrollbarCustom>
      <AppHeader />
      <CenteredContainer>{children}</CenteredContainer>
    </ScrollbarCustom>
  </motion.main>
)

export default styled(LockedWalletLayout)`
  display: flex;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background1};
`

const Logo = styled.div`
  flex: 1;
  padding: 5px;
`

const AlephiumLogotypeStyled = styled(AlephiumLogotype)`
  height: 120px;
  fill: ${({ theme }) => theme.font.primary};
  color: ${({ theme }) => theme.font.primary};
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 100%;
`
