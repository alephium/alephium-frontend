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
import styled from 'styled-components'

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

  useEffect(() => {
    if (isAnimated) {
      controls.start({ rotate: 360, transition: { duration: 40, repeat: Infinity, ease: 'linear' } })
    }
  }, [controls, isAnimated])

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
          opacity: 0.5,
          top: '-30%'
        }}
      >
        <Circle
          custom={80}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#6abce8', width: 320, height: 180 }}
        />
        <Circle
          custom={120}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#2930ff', width: 380, height: 140 }}
        />
        <Circle
          custom={100}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#0762ff', width: 360, height: 120 }}
        />
        <Circle
          custom={140}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#00a2ff', width: 500, height: 260 }}
        />
        <Circle
          custom={60}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#00eeff', width: 240, height: 200 }}
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
      <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blurred" />
      <feTurbulence type="turbulence" baseFrequency="0.8" numOctaves="2" />
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
