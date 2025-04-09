import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { closeModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface HiddenTokensButtonProps {
  tokensCount: number
  parentModalId?: ModalInstance['id']
}

const HiddenTokensButton = ({ tokensCount, parentModalId }: HiddenTokensButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleHiddenAssetsPress = () => {
    navigation.navigate('HiddenTokensScreen')

    parentModalId && dispatch(closeModal({ id: parentModalId }))
  }

  return (
    <HiddenTokensButtonStyled>
      <Button
        title={t('nb_of_hidden_assets', { count: tokensCount })}
        onPress={handleHiddenAssetsPress}
        iconProps={{ name: 'plus' }}
        compact
      />
    </HiddenTokensButtonStyled>
  )
}

export default HiddenTokensButton

const HiddenTokensButtonStyled = styled.View`
  flex-grow: 0;
  margin: ${VERTICAL_GAP}px auto 0;
`
