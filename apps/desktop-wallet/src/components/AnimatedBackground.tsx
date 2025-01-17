import { animate, motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

interface AnimatedBackgroundProps {
  height?: number | string
  width?: number | string
  className?: string
  anchorPosition?: AnchorPosition
  reactToPointer?: boolean
  verticalOffset?: number
}

type AnchorPosition = 'top' | 'bottom'

const AnimatedBackground = ({
  height = '100%',
  width = '100%',
  className,
  reactToPointer = true,
  anchorPosition = 'top',
  verticalOffset = 0
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
        // Anchor horizontally at the middle, vertically at top or bottom.
        mouseX.set(window.innerWidth / 2)
        mouseY.set(anchorPosition === 'top' ? 0 : window.innerHeight)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [mouseX, mouseY, anchorPosition])

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

  // Apply verticalOffset to each circle's animation
  const circle1 = useCircleAnimation(
    offsets[0],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    anchorPosition
  )
  const circle2 = useCircleAnimation(
    offsets[1],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    anchorPosition
  )
  const circle3 = useCircleAnimation(
    offsets[2],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    anchorPosition
  )
  const circle4 = useCircleAnimation(
    offsets[3],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    anchorPosition
  )
  const circle5 = useCircleAnimation(
    offsets[4],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    anchorPosition
  )

  // Original hardcoded dimensions
  const circlesDimensions = [
    { width: 1600, height: 290 },
    { width: 800, height: 380 },
    { width: 960, height: 310 },
    { width: 1300, height: 200 },
    { width: 1240, height: 140 }
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
          alignItems: anchorPosition === 'top' ? 'flex-start' : 'flex-end',
          justifyContent: 'center',
          opacity: isDarkTheme ? 0.6 : 1
        }}
      >
        {circlesDimensions.map((dim, index) => {
          const circleAnimation = [circle1, circle2, circle3, circle4, circle5][index]
          const backgroundColors = [
            isDarkTheme ? '#120096' : '#c689ff',
            isDarkTheme ? '#ab2cdd' : '#ffd4b6',
            isDarkTheme ? '#ff6969' : '#ffaaaa',
            isDarkTheme ? '#8f2cdb' : '#ffb7ff',
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
                y: circleAnimation.y
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
  verticalOffset: number,
  anchorPosition: AnchorPosition
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
    stiffness: 90,
    damping: 100
  })

  const ySpring = useSpring(useTransform(mouseY, [0, windowSize.height * 2], [-offset, offset]), {
    stiffness: 90,
    damping: 100
  })

  // Combine the circle's own "wobble" with pointer movement
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

  const yWithOffset = useTransform(y, (value) =>
    anchorPosition === 'top' ? value + verticalOffset : value - verticalOffset
  )

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
