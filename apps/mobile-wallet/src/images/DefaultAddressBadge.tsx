import { Canvas, FitBox, Path, rect } from '@shopify/react-native-skia'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface DefaultAddressBadgeProps {
  color?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

const DefaultAddressBadge = ({ size = 26, color = 'white', ...props }: DefaultAddressBadgeProps) => (
  <DefaultAddressBadgeStyled size={size} {...props}>
    <StarShape size={size - 4} color={color} />
  </DefaultAddressBadgeStyled>
)

const StarShape = ({ size, color = 'white' }: { size: number; color: string }) => {
  const path = 'M12 1L15.5 8L24 9L17.5 14L19 22L12 18L5 22L6.5 14L0 9L8.5 8L12 1Z'

  return (
    <Canvas style={{ width: size, height: size }}>
      <FitBox src={rect(0, 0, 24, 24)} dst={rect(0, 0, size, size)}>
        <Path path={path} color={color} style="fill" />
      </FitBox>
    </Canvas>
  )
}

export default DefaultAddressBadge

const DefaultAddressBadgeStyled = styled.View<DefaultAddressBadgeProps>`
  justify-content: center;
  align-items: center;
  border-radius: ${({ size }) => size! / 2}px;
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`
