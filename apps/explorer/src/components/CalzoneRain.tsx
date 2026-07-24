import { useReducedMotion } from 'framer-motion'
import styled, { keyframes } from 'styled-components'

import CalzoneIcon from '@/images/calzone.svg?react'

const CALZONE_COUNT = 14

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const CALZONES = Array.from({ length: CALZONE_COUNT }, (_, i) => {
  const spread = 100 / CALZONE_COUNT
  return {
    left: i * spread + pseudoRandom(i + 1) * spread,
    size: 20 + pseudoRandom(i + 100) * 18,
    duration: 8 + pseudoRandom(i + 200) * 7,
    delay: -pseudoRandom(i + 300) * 15,
    sway: (pseudoRandom(i + 400) - 0.5) * 80,
    spin: (pseudoRandom(i + 500) - 0.5) * 720
  }
})

const CalzoneRain = () => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return null

  return (
    <RainContainer aria-hidden="true">
      {CALZONES.map((c, i) => (
        <Calzone
          key={i}
          $left={c.left}
          $size={c.size}
          $duration={c.duration}
          $delay={c.delay}
          $sway={c.sway}
          $spin={c.spin}
        />
      ))}
    </RainContainer>
  )
}

export default CalzoneRain

const fall = keyframes`
  0% {
    transform: translate3d(0, -20vh, 0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.9;
  }
  90% {
    opacity: 0.9;
  }
  100% {
    transform: translate3d(var(--sway), 120vh, 0) rotate(var(--spin));
    opacity: 0;
  }
`

const RainContainer = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 4;
`

const Calzone = styled(CalzoneIcon)<{
  $left: number
  $size: number
  $duration: number
  $delay: number
  $sway: number
  $spin: number
}>`
  position: absolute;
  top: 0;
  left: ${({ $left }) => $left}%;
  width: ${({ $size }) => $size}px;
  height: auto;
  opacity: 0;
  will-change: transform, opacity;
  --sway: ${({ $sway }) => $sway}px;
  --spin: ${({ $spin }) => $spin}deg;
  animation: ${fall} ${({ $duration }) => $duration}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`
