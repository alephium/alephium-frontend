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
import { motion, useAnimation } from 'framer-motion'
import React, { useEffect } from 'react'
import styled, { useTheme } from 'styled-components'

interface AnimatedBackgroundProps {
  height?: number
  width?: number
  isAnimated?: boolean
}

const circleVariants = {
  animate: (offset: number) => ({
    x: [0, offset, 0, -offset, 0],
    y: [0, offset / 2, -offset / 2, offset / 2, 0],
    transition: { duration: 20 + offset / 10, repeat: Infinity, ease: 'easeInOut' }
  })
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  height = '100%',
  width = '100%',
  isAnimated = false
}) => {
  const controls = useAnimation()
  const theme = useTheme()

  useEffect(() => {
    if (isAnimated) {
      controls.start({ rotate: 360, transition: { duration: 40, repeat: Infinity, ease: 'linear' } })
    }
  }, [controls, isAnimated])

  const isDarkTheme = theme.name === 'dark'

  return (
    <AnimatedContainer style={{ width, height }}>
      <motion.div
        animate={controls}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          filter: 'url(#combinedFilter)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDarkTheme ? 0.5 : 0.6
        }}
      >
        <Circle
          custom={80}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#0f9ce3' : '#ffb299', width: 720, height: 180 }}
        />
        <Circle
          custom={120}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#ffc6a0', width: 1080, height: 240 }}
        />
        <Circle
          custom={100}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#ffba9e', width: 960, height: 220 }}
        />
        <Circle
          custom={140}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#006eff' : '#8280ff', width: 900, height: 360 }}
        />
        <Circle
          custom={60}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#0088ff' : '#8476ff', width: 540, height: 300 }}
        />
      </motion.div>
      <SvgFilters />
    </AnimatedContainer>
  )
}

export default AnimatedBackground

const SvgFilters = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <filter id="combinedFilter">
      <feGaussianBlur in="SourceGraphic" stdDeviation="80" result="blurred" />
      <feTurbulence type="turbulence" baseFrequency="0.5" numOctaves="2" />
      <feComposite in="noise" in2="blurred" operator="in" result="maskedNoise" />
      <feBlend in="blurred" in2="maskedNoise" mode="screen" />
    </filter>
  </svg>
)

const AnimatedContainer = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  overflow: visible;
`

const Circle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
`
