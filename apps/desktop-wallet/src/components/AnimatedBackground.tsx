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
import styled, { useTheme } from 'styled-components'

interface AnimatedBackgroundProps {
  height?: number | string
  width?: number | string
  className?: string
}

const circleVariants = {
  animate: (offset: number) => ({
    x: [0, offset, 0, -offset, 0],
    y: [0, offset / 2, -offset / 2, offset / 2, 0],
    transition: { duration: offset / 5, repeat: Infinity, ease: 'easeInOut' }
  })
}

const AnimatedBackground = ({ height = '100%', width = '100%', className }: AnimatedBackgroundProps) => {
  const controls = useAnimation()
  const theme = useTheme()

  const isDarkTheme = theme.name === 'dark'

  return (
    <AnimatedContainer style={{ width, height }} className={className}>
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
          opacity: isDarkTheme ? 0.5 : 0.8
        }}
      >
        <Circle
          custom={80}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#120096' : '#c689ff', width: 1000, height: 480 }}
        />
        <Circle
          custom={300}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#fda066', width: 400, height: 540 }}
        />
        <Circle
          custom={200}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: '#ff6969', width: 660, height: 400 }}
        />
        <Circle
          custom={140}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#e484ff' : '#d579ff', width: 1000, height: 200 }}
        />
        <Circle
          custom={20}
          variants={circleVariants}
          animate="animate"
          style={{ backgroundColor: isDarkTheme ? '#1600da' : '#ff9bc8', width: 940, height: 140 }}
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
      {/*<feTurbulence type="turbulence" baseFrequency="0.5" numOctaves="2" />
      <feComposite in="noise" in2="blurred" operator="in" result="maskedNoise" />
      <feBlend in="blurred" in2="maskedNoise" mode="screen" />*/}
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
