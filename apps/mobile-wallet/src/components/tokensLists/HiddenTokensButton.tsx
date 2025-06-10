import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface HiddenTokensButtonProps extends ButtonProps {
  tokensCount: number
}

const HiddenTokensButton = ({ tokensCount, ...props }: HiddenTokensButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  const handlePress = (e: GestureResponderEvent) => {
    props.onPress?.(e)
    navigation.navigate('HiddenTokensScreen')
  }

  return (
    <HiddenTokensButtonStyled>
      <Button
        title={t('nb_of_hidden_assets', { count: tokensCount })}
        iconProps={{ name: 'add' }}
        compact
        {...props}
        onPress={handlePress}
      />
    </HiddenTokensButtonStyled>
  )
}

export default HiddenTokensButton

const HiddenTokensButtonStyled = styled.View`
  flex-grow: 0;
  margin: ${VERTICAL_GAP}px auto 0;
`
