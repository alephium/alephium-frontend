import { colord } from 'colord'
import { CameraOff } from 'lucide-react-native'
import { DimensionValue } from 'react-native'
import styled from 'styled-components/native'

import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface NFTPlaceholderProps {
  size?: DimensionValue
  showCameraOff?: boolean
}

const NFTPlaceholder = ({ size = '100%', showCameraOff = true }: NFTPlaceholderProps) => (
  <NoImage style={{ width: size, height: size }}>{showCameraOff && <CameraOff color="gray" size="30%" />}</NoImage>
)

export default NFTPlaceholder

const NoImage = styled.View`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => colord(theme.bg.back2).darken(0.07).toHex()};
  aspect-ratio: 1;
`
