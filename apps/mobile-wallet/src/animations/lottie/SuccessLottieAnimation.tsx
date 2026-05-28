import LottieView, { LottieViewProps } from 'lottie-react-native'
import styled from 'styled-components/native'

import animationSrc from '~/animations/lottie/success.json'

const SuccessLottieAnimation = (props: Omit<LottieViewProps, 'source'>) => (
  <SuccessLottieAnimationStyled  autoPlay {...props} source={animationSrc}/>
)

export default SuccessLottieAnimation

const SuccessLottieAnimationStyled = styled(LottieView)`
  width: 80%;
  height: 100%;
`