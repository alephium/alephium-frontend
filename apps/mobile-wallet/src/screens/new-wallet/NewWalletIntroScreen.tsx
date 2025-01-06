import { NativeStackScreenProps } from '@react-navigation/native-stack'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import animationSrc from '~/animations/lottie/wallet.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface NewWalletIntroScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'NewWalletIntroScreen'>,
    ScreenProps {}

const instructionsCreate: Instruction[] = [
  { text: 'You are about to create a wallet 🎉', type: 'primary' },
  { text: 'Your gateway to the Alephium ecosystem', type: 'secondary' }
]
const instructionsImport: Instruction[] = [
  { text: 'You are about to import a wallet 🎉', type: 'primary' },
  { text: 'Get your secret phrase ready!', type: 'secondary' }
]

const instructions = {
  create: instructionsCreate,
  import: instructionsImport
}

const NewWalletIntroScreen = ({ navigation, ...props }: NewWalletIntroScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method) || 'create'
  const { t } = useTranslation()

  return (
    <ScrollScreen fill contentPaddingTop headerOptions={{ type: 'stack' }} {...props}>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions[method]} />
      <BottomButtonsStyled>
        <Button
          title={t("Let's go!")}
          type="primary"
          variant="highlight"
          onPress={() => navigation.navigate('NewWalletNameScreen')}
        />
        <Button title={t('Cancel')} type="secondary" onPress={() => navigation.goBack()} />
      </BottomButtonsStyled>
    </ScrollScreen>
  )
}

export default NewWalletIntroScreen

const AnimationContainer = styled.View`
  flex: 2;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 40%;
  height: 100%;
`

const BottomButtonsStyled = styled(BottomButtons)`
  flex: 2;
  justify-content: flex-end;
`
