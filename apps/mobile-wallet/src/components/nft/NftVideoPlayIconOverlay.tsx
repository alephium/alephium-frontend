import { PlayCircleIcon } from 'lucide-react-native'
import { View, ViewProps } from 'react-native'
import styled from 'styled-components/native'

const NftVideoPlayIconOverlay = ({ children, ...props }: ViewProps) => (
  <View {...props}>
    {children}
    <PlayIconWrapper>
      <PlayCircleIcon color="white" size={30} />
    </PlayIconWrapper>
  </View>
)

export default NftVideoPlayIconOverlay

const PlayIconWrapper = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
`
