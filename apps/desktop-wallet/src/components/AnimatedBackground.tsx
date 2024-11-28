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

import { animate, motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

interface AnimatedBackgroundProps {
  height?: number | string
  width?: number | string
  className?: string
  reactToPointer?: boolean
}

function useCircleAnimation(
  offset: number,
  windowSize: { width: number; height: number },
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>,
  reactToPointer: boolean
) {
  // Motion values for animation
  const xAnim = useMotionValue(0)
  const yAnim = useMotionValue(0)

  // Start the animations
  useEffect(() => {
    const xValues = [0, offset, 0, -offset, 0]
    const yValues = [0, offset / 2, -offset / 2, offset / 2, 0]
    const duration = offset / 5

    const xControl = animate(xAnim, xValues, {
      duration,
      repeat: Infinity,
      ease: 'easeInOut'
    })

    const yControl = animate(yAnim, yValues, {
      duration,
      repeat: Infinity,
      ease: 'easeInOut'
    })

    return () => {
      xControl.stop()
      yControl.stop()
    }
  }, [offset, xAnim, yAnim])

  // Transforms for pointer movement
  const xSpring = useSpring(useTransform(mouseX, [0, windowSize.width], [offset, -offset]), {
    stiffness: 100,
    damping: 80
  })

  const ySpring = useSpring(useTransform(mouseY, [0, windowSize.height], [offset, -offset]), {
    stiffness: 100,
    damping: 80
  })

  // Combine animations with pointer movement
  const xTotal = useTransform([xAnim, xSpring], ([xA, xP]) => xA + xP)
  const yTotal = useTransform([yAnim, ySpring], ([yA, yP]) => yA + yP)

  // Return the x and y values
  const x = reactToPointer ? xTotal : xAnim
  const y = reactToPointer ? yTotal : yAnim

  return { x, y }
}

const AnimatedBackground = ({
  height = '100%',
  width = '100%',
  className,
  reactToPointer = true
}: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isDarkTheme = theme.name === 'dark'

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Motion values for mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Update window size and initialize mouse position
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        mouseX.set(window.innerWidth / 2)
        mouseY.set(window.innerHeight / 2)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [mouseX, mouseY])

  // Handle global mouse movement
  useEffect(() => {
    let animationFrameId: number

    const handleMouseMove = (event: MouseEvent) => {
      animationFrameId = window.requestAnimationFrame(() => {
        mouseX.set(event.clientX)
        mouseY.set(event.clientY)
      })
    }

    if (reactToPointer && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (reactToPointer && typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [reactToPointer, mouseX, mouseY])

  // Offsets for each circle
  const offsets = [80, 300, 200, 140, 20]

  // Use the custom hook for each circle
  const circle1 = useCircleAnimation(offsets[0], windowSize, mouseX, mouseY, reactToPointer)
  const circle2 = useCircleAnimation(offsets[1], windowSize, mouseX, mouseY, reactToPointer)
  const circle3 = useCircleAnimation(offsets[2], windowSize, mouseX, mouseY, reactToPointer)
  const circle4 = useCircleAnimation(offsets[3], windowSize, mouseX, mouseY, reactToPointer)
  const circle5 = useCircleAnimation(offsets[4], windowSize, mouseX, mouseY, reactToPointer)

  return (
    <AnimatedContainer style={{ width, height }} className={className}>
      <motion.div
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
          style={{
            backgroundColor: isDarkTheme ? '#120096' : '#c689ff',
            width: 1000,
            height: 480,
            x: circle1.x,
            y: circle1.y
          }}
        />
        <Circle
          style={{
            backgroundColor: '#fda066',
            width: 400,
            height: 540,
            x: circle2.x,
            y: circle2.y
          }}
        />
        <Circle
          style={{
            backgroundColor: '#ff6969',
            width: 660,
            height: 400,
            x: circle3.x,
            y: circle3.y
          }}
        />
        <Circle
          style={{
            backgroundColor: isDarkTheme ? '#e484ff' : '#d579ff',
            width: 1000,
            height: 200,
            x: circle4.x,
            y: circle4.y
          }}
        />
        <Circle
          style={{
            backgroundColor: isDarkTheme ? '#1600da' : '#ff9bc8',
            width: 940,
            height: 140,
            x: circle5.x,
            y: circle5.y
          }}
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
      {/* Additional filter definitions */}
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
