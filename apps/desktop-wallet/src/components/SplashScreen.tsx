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

import { motion } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import { slowTransition } from '@/animations'
import alephiumLogo from '@/images/alephium_logo_monochrome.svg'

const SplashScreen = () => {
  const [splashScreenVisible, setSplashScreenVisible] = useState(true)

  if (!splashScreenVisible) return null

  return (
    <StyledSplashScreen
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 1 }}
      onAnimationComplete={() => setSplashScreenVisible(false)}
    >
      <AlephiumLogoContainer
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        {...slowTransition}
      >
        <AlephiumLogo />
      </AlephiumLogoContainer>
    </StyledSplashScreen>
  )
}

export default SplashScreen

const StyledSplashScreen = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg.background1};
`

const AlephiumLogoContainer = styled(motion.div)`
  width: 150px;
  height: 150px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.secondary)};
`

const AlephiumLogo = styled.div`
  background-image: url(${alephiumLogo});
  background-repeat: no-repeat;
  background-position: center;
  width: 60%;
  height: 60%;
  margin: auto;
`
