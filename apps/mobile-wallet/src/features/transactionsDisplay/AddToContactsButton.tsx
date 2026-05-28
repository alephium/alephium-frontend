import { AddressHash, selectAddressByHash } from '@alephium/shared'
import Lucide from '@react-native-vector-icons/lucide/static'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'

interface AddToContactsButtonProps {
  addressHash: AddressHash
}

const AddToContactsButton = ({ addressHash }: AddToContactsButtonProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))
  const { dismissAll } = useModalContext()

  if (address || contact) return null

  const handleLinkPress = () => {
    dismissAll()
    navigation.navigate('NewContactScreen', { addressHash })
  }

  return (
    <AddToContactsButtonStyled>
      <Lucide name="plus" size={12} color={theme.global.accent} />
      <AppText onPress={handleLinkPress} color="accent" size={12}>
        {t('Add to contacts')}
      </AppText>
    </AddToContactsButtonStyled>
  )
}

export default AddToContactsButton

const AddToContactsButtonStyled = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
`
