import { motion } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import alephiumLogo from '@/images/alephium_logo_monochrome.svg'

const SplashScreen = () => {
  const [splashScreenVisible, setSplashScreenVisible] = useState(true)

  if (!splashScreenVisible) return null

  return (
    <StyledSplashScreen
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      onAnimationComplete={() => setSplashScreenVisible(false)}
    >
      <AlephiumLogoContainer
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        {...fastTransition}
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
