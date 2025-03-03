// Inpired by https://github.com/ashiishme/react-sine-wave

import { useRef } from 'react'
import styled from 'styled-components'

import useAnimationFrame from '@/hooks/useAnimationFrame'
import { useWindowSize } from '@/hooks/useWindowSize'

import WaveEntity from './WaveEntity'

const Waves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContextRef = useRef<CanvasRenderingContext2D>()

  const { width } = useWindowSize()

  let t = 0
  let f = 0

  useAnimationFrame((deltaTime) => {
    t = t + deltaTime / 1000.0
    f += 1

    // 60 fps / 8 ~= 8fps
    // Given the speed of the animation this is sufficient to look smooth
    if (f != 8) return
    f = 0

    const { innerWidth } = window

    if (canvasContextRef.current) {
      canvasContextRef.current.clearRect(0, 0, innerWidth, staticHeight)
      Object.entries(waves).forEach((w) => {
        w[1].draw(canvasContextRef.current as CanvasRenderingContext2D, innerWidth, staticHeight, t / 20.0)
      })
    } else {
      let ctx
      if ((ctx = canvasRef.current?.getContext('2d'))) {
        canvasContextRef.current = ctx
      }
    }
  })

  return (
    <CanvasContainer style={{ height: `${staticHeight}px` }}>
      <canvas id="canvas" ref={canvasRef} width={width} height={staticHeight} />
    </CanvasContainer>
  )
}

const staticHeight = 600

const waves: [WaveEntity, WaveEntity] = [
  new WaveEntity([0.0081, 0.028, 0.015], 1, 1, ['rgba(22, 204, 244, 0.6)', 'rgba(101, 16, 248, 0)']),
  new WaveEntity([0.0022, 0.018, 0.005], 1, 1.2, ['rgba(244, 129, 22, 0.6)', 'rgba(101, 16, 248, 0)'])
]

const CanvasContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
`

export default Waves
