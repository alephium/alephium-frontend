import LottieView from 'lottie-react-native'
import styled from 'styled-components/native'

const WalletLottieAnimation = () => <StyledAnimation source={require('./wallet.json')} autoPlay speed={1.2} />

export default WalletLottieAnimation

const StyledAnimation = styled(LottieView)`
  width: 45%;
  height: 100%;
`
