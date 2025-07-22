// Inpired by https://github.com/ashiishme/react-sine-wave

import { useCallback, useRef } from 'react'
import styled from 'styled-components'

import useAnimationFrame from '@/hooks/useAnimationFrame'
import { useWindowSize } from '@/hooks/useWindowSize'

import WaveEntity from './WaveEntity'

const Waves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const t = useRef(0)
  const f = useRef(0)

  const { width } = useWindowSize()

  const callback = useCallback((deltaTime: number) => {
    t.current = t.current + deltaTime / 1000.0
    f.current += 1

    // 60 fps / 8 ~= 8fps
    // Given the speed of the animation this is sufficient to look smooth
    if (f.current != 8) return
    f.current = 0

    const { innerWidth } = window

    if (canvasContextRef.current) {
      canvasContextRef.current.clearRect(0, 0, innerWidth, staticHeight)
      canvasContextRef.current.globalCompositeOperation = 'hard-light'
      Object.entries(waves).forEach((w) => {
        w[1].draw(canvasContextRef.current as CanvasRenderingContext2D, innerWidth, staticHeight, t.current / 20.0)
      })
    } else {
      let ctx
      if ((ctx = canvasRef.current?.getContext('2d'))) {
        canvasContextRef.current = ctx
      }
    }
  }, [])

  useAnimationFrame(callback)

  return (
    <CanvasContainer style={{ height: `${staticHeight}px` }}>
      <canvas id="canvas" ref={canvasRef} width={width} height={staticHeight} />
    </CanvasContainer>
  )
}

const staticHeight = 600

const waves: [WaveEntity, WaveEntity] = [
  new WaveEntity([0.0041, 0.02, 0.008], 0.9, 0.1, ['#5cd1ffac', 'rgba(126, 223, 255, 0)']),
  new WaveEntity([0.0172, 0.014, 0.005], 0.8, 0.1, ['#d167ff75', 'rgba(207, 136, 255, 0)'])
]

const CanvasContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
  opacity: 0.7;
`

export default Waves
