import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

const BottomModalHandle = styled(Animated.View)`
  width: 10%;
  height: 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.border.primary};
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
`

export default BottomModalHandle
