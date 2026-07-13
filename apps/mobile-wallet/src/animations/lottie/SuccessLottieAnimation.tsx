import LottieView, { LottieViewProps } from 'lottie-react-native'
import styled from 'styled-components/native'

const SuccessLottieAnimation = (props: Omit<LottieViewProps, 'source'>) => (
  <SuccessLottieAnimationStyled {...props} autoPlay source={require('./success.json')} />
)

export default SuccessLottieAnimation

const SuccessLottieAnimationStyled = styled(LottieView)`
  width: 80%;
  height: 100%;
`
