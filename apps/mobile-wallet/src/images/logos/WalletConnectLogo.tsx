import { Canvas, FitBox, Path, rect } from '@shopify/react-native-skia'

interface WalletConnectLogoProps {
  width?: number
  height?: number
  color?: string
}

const WalletConnectLogo = ({ width = 192, height = 119, color = '#fff' }: WalletConnectLogoProps) => (
  <Canvas style={{ width, height }}>
    <FitBox src={rect(0, 0, 192, 119)} dst={rect(0, 0, width, height)}>
      <Path
        color={color}
        path="M39.306 23.803c31.312-30.533 82.077-30.533 113.388 0l3.768 3.675a3.84 3.84 0 0 1 0 5.529l-12.891 12.57a2.04 2.04 0 0 1-2.834 0l-5.186-5.057c-21.843-21.3-57.258-21.3-79.102 0l-5.553 5.416a2.04 2.04 0 0 1-2.835 0l-12.89-12.57a3.84 3.84 0 0 1 0-5.53l4.135-4.033ZM179.353 49.8l11.473 11.188a3.842 3.842 0 0 1 0 5.528l-51.732 50.447c-1.565 1.527-4.103 1.527-5.669 0L96.709 81.16a1.02 1.02 0 0 0-1.417 0l-36.715 35.803c-1.566 1.527-4.104 1.527-5.67 0L1.174 66.516a3.84 3.84 0 0 1 0-5.529L12.647 49.8c1.566-1.527 4.104-1.527 5.67 0l36.716 35.804a1.02 1.02 0 0 0 1.417 0L93.165 49.8c1.565-1.527 4.103-1.527 5.67 0l36.716 35.804a1.02 1.02 0 0 0 1.417 0L173.684 49.8c1.565-1.526 4.104-1.526 5.669 0Z"
      />
    </FitBox>
  </Canvas>
)

export default WalletConnectLogo
