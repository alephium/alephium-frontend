import { Blur, Canvas, Fill, LinearGradient, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import { colord } from 'colord'
import { Group } from 'lucide-react-native'
import { memo, useState } from 'react'
import { LayoutChangeEvent } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

interface AnimatedBackgroundProps {
  offsetTop?: number
  shade?: string
}

const AnimatedBackground = memo(({ offsetTop = 0, shade }: AnimatedBackgroundProps) => {
  const theme = useTheme()
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })

  const linearGradientPositions = [0.1, 0.2, 0.6, 0.7, 0.75, 1]
  const radialGradientPositions = [0.4, 0.5, 0.6, 0.7, 0.75, 1]

  const getGradientColors = (opacity: number) => [
    colord(shade || theme.global.palette2)
      .alpha(opacity)
      .toHex(),
    colord(shade || theme.global.palette5)
      .alpha(opacity)
      .toHex(),
    colord(theme.global.palette4).alpha(opacity).toHex(),
    colord(theme.global.palette1).alpha(opacity).toHex(),
    colord(theme.global.palette3).alpha(opacity).toHex(),
    theme.bg.back2
  ]

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }

  return (
    <Container onLayout={handleLayout} style={{ top: offsetTop }}>
      <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Group>
          <Fill color={theme.bg.primary} />
          <Rect x={0} y={0} width={containerDimensions.width} height={containerDimensions.height}>
            <LinearGradient
              colors={getGradientColors(1)}
              positions={linearGradientPositions}
              start={vec(0, 0)}
              end={vec(containerDimensions.width, containerDimensions.height)}
            />
          </Rect>
          <Rect x={0} y={0} width={containerDimensions.width} height={containerDimensions.height} opacity={0.9}>
            <RadialGradient
              c={vec(containerDimensions.width / 2, containerDimensions.height + 50)}
              r={containerDimensions.width * 0.5}
              colors={getGradientColors(theme.name === 'light' ? 0.5 : 0.9)}
              positions={radialGradientPositions}
            />
          </Rect>
          <Blur blur={20} />
        </Group>
      </Canvas>
    </Container>
  )
})

export default AnimatedBackground

const Container = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`
