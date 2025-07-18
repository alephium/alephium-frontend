import { colord } from 'colord'
import { animate, motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

interface AnimatedBackgroundProps {
  height?: number | string
  width?: number | string
  opacity?: number
  className?: string
  shade?: 'dark' | 'light' | string
  anchorPosition?: AnchorPosition
  reactToPointer?: boolean
  hiddenOverflow?: boolean
  verticalOffset?: number
  horizontalOffset?: number
  scaleY?: number
}

type AnchorPosition = 'top' | 'bottom'

const DARK_COLORS = ['#3f3fff', '#8394ff', '#276bff', '#ff7f58', '#381eff']
const LIGHT_COLORS = ['#ad6eff', '#ffb47f', '#ffaaaa', '#ffc089', '#ff9bc8']

const AnimatedBackground = ({
  height = '100%',
  width = '100%',
  opacity = 1,
  className,
  shade,
  reactToPointer = true,
  anchorPosition = 'top',
  hiddenOverflow,
  scaleY,
  verticalOffset = 0,
  horizontalOffset = 0
}: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const isDarkTheme = theme.name === 'dark'
  const backgroundColors = getBackgroundColors(shade, isDarkTheme)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
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
        mouseY.set(anchorPosition === 'top' ? 0 : window.innerHeight)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [mouseX, mouseY, anchorPosition])

  useEffect(() => {
    let animationFrameId: number
    let lastUpdateTime = performance.now()
    const FRAME_DURATION = 16 // 60fps

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now()

      if (now - lastUpdateTime >= FRAME_DURATION) {
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId)
        }

        animationFrameId = window.requestAnimationFrame(() => {
          mouseX.set(event.clientX)
          mouseY.set(event.clientY)
          lastUpdateTime = now
          animationFrameId = 0
        })
      }
    }

    if (reactToPointer && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (reactToPointer && typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId)
        }
      }
    }
  }, [reactToPointer, mouseX, mouseY])

  // Offsets for each circle
  const offsets = [80, 200, 100, 140, 20]

  const circle1 = useCircleAnimation(
    offsets[0],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    horizontalOffset,
    anchorPosition
  )
  const circle2 = useCircleAnimation(
    offsets[1],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    horizontalOffset,
    anchorPosition
  )
  const circle3 = useCircleAnimation(
    offsets[2],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    horizontalOffset,
    anchorPosition
  )
  const circle4 = useCircleAnimation(
    offsets[3],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    horizontalOffset,
    anchorPosition
  )
  const circle5 = useCircleAnimation(
    offsets[4],
    windowSize,
    mouseX,
    mouseY,
    reactToPointer,
    verticalOffset,
    horizontalOffset,
    anchorPosition
  )

  const circlesDimensions = [
    { width: 500, height: 70 },
    { width: 600, height: 80 },
    { width: 550, height: 70 }
  ]

  return (
    <AnimatedContainer
      style={{
        width,
        height,
        opacity,
        overflow: hiddenOverflow ? 'hidden' : 'visible',
        transform: `scaleY(${scaleY})`,
        transformOrigin: anchorPosition === 'top' ? 'top' : 'bottom'
      }}
      className={className}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: 'easeOut' }}
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
  horizontalOffset: number,
  anchorPosition: AnchorPosition
) => {
  const xAnim = useMotionValue(0)
  const yAnim = useMotionValue(0)

  useEffect(() => {
    const xValues = [0, offset, 0, -offset, 0]
    const yValues = [0, offset / 2, -offset / 2, offset / 2, 0]
    // Increase the duration to slow down the animation (e.g. *2)
    const duration = Math.abs(offset) / 5

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
  const xWithOffset = useTransform(x, (value) => value + horizontalOffset)

  return { x: xWithOffset, y: yWithOffset }
}

const getBackgroundColors = (shade: AnimatedBackgroundProps['shade'], isDarkTheme: boolean): string[] => {
  if (shade === 'dark') return DARK_COLORS
  if (shade === 'light') return LIGHT_COLORS
  if (typeof shade === 'string') {
    const base = colord(shade)
    const offsets = [-40, -20, 0, 20, 40]
    return offsets.map((offset) => base.rotate(offset).toHex())
  }
  return isDarkTheme ? DARK_COLORS : LIGHT_COLORS
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
  z-index: 0;
  pointer-events: none;
  will-change: transform;
`

const Circle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: color-burn;
`
