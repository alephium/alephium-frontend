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
  offsetTop?: number
}

const AnimatedBackground = ({
  height = '100%',
  width = '100%',
  className,
  reactToPointer = true,
  offsetTop = 0
}: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isDarkTheme = theme.name === 'dark'

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Motion values for mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        })
        mouseX.set(window.innerWidth / 2)
        mouseY.set(window.innerHeight / 2)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [mouseX, mouseY])

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

  // Apply offsetTop to each circle's animation
  const circle1 = useCircleAnimation(offsets[0], windowSize, mouseX, mouseY, reactToPointer, offsetTop)
  const circle2 = useCircleAnimation(offsets[1], windowSize, mouseX, mouseY, reactToPointer, offsetTop)
  const circle3 = useCircleAnimation(offsets[2], windowSize, mouseX, mouseY, reactToPointer, offsetTop)
  const circle4 = useCircleAnimation(offsets[3], windowSize, mouseX, mouseY, reactToPointer, offsetTop)
  const circle5 = useCircleAnimation(offsets[4], windowSize, mouseX, mouseY, reactToPointer, offsetTop)

  // Original hardcoded dimensions
  const circlesDimensions = [
    { width: 1200, height: 290 },
    { width: 600, height: 380 },
    { width: 760, height: 310 },
    { width: 1100, height: 200 },
    { width: 1040, height: 140 }
  ]

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
        {circlesDimensions.map((dim, index) => {
          const circleAnimation = [circle1, circle2, circle3, circle4, circle5][index]
          const backgroundColors = [
            isDarkTheme ? '#120096' : '#c689ff',
            isDarkTheme ? '#ff8119' : '#ffd4b6',
            isDarkTheme ? '#ff6969' : '#ffaaaa',
            isDarkTheme ? '#e484ff' : '#ffb7ff',
            isDarkTheme ? '#1600da' : '#ff9bc8'
          ]
          return (
            <Circle
              key={index}
              style={{
                backgroundColor: backgroundColors[index],
                width: `${dim.width}px`,
                height: `${dim.height}px`,
                x: circleAnimation.x,
                y: circleAnimation.y // This now includes offsetTop
              }}
            />
          )
        })}
      </motion.div>
      <SvgFilters />
    </AnimatedContainer>
  )
}

export default AnimatedBackground

const useCircleAnimation = (
  offset: number,
  windowSize: { width: number; height: number },
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>,
  reactToPointer: boolean,
  offsetY: number
) => {
  const xAnim = useMotionValue(0)
  const yAnim = useMotionValue(0)

  useEffect(() => {
    const xValues = [0, offset, 0, -offset, 0]
    const yValues = [0, offset / 2, -offset / 2, offset / 2, 0]
    const duration = Math.abs(offset) / 10

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

  const xSpring = useSpring(useTransform(mouseX, [0, windowSize.width], [-offset, offset]), {
    stiffness: 100,
    damping: 80
  })

  const ySpring = useSpring(useTransform(mouseY, [0, windowSize.height], [-offset, offset]), {
    stiffness: 100,
    damping: 80
  })

  // Combine animations with pointer movement
  const xTotal = useTransform([xAnim, xSpring], (inputs) => {
    const [xA, xP] = inputs as [number, number]
    return xA + xP
  })

  const yTotal = useTransform([yAnim, ySpring], (inputs) => {
    const [yA, yP] = inputs as [number, number]
    return yA + yP
  })

  const x = reactToPointer ? xTotal : xAnim
  const y = reactToPointer ? yTotal : yAnim

  // Adjust y with offsetY
  const yWithOffset = useTransform(y, (value) => value + offsetY)

  return { x, y: yWithOffset }
}

const SvgFilters = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <filter id="combinedFilter">
      <feGaussianBlur in="SourceGraphic" stdDeviation="100" result="blurred" />
    </filter>
  </svg>
)

const AnimatedContainer = styled.div`
  flex: 1;
  width: 100%;
  position: absolute;
  right: 0;
  left: 0;
  overflow: hidden;
`

const Circle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
`
