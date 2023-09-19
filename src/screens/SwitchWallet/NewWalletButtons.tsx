/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { NavigationProp, useNavigation } from '@react-navigation/native'

import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'

interface NewWalletButtonsProps {
  onButtonPress?: () => void
}

const NewWalletButtons = ({ onButtonPress }: NewWalletButtonsProps) => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    onButtonPress && onButtonPress()
    navigation.navigate('NewWalletIntroScreen')
  }

  return (
    <ButtonsRow>
      <Button
        title="New wallet"
        onPress={() => handleButtonPress('create')}
        iconProps={{ name: 'add-outline' }}
        style={{ flex: 1 }}
      />
      <Button
        title="Import wallet"
        onPress={() => handleButtonPress('import')}
        iconProps={{ name: 'arrow-down-outline' }}
        style={{ flex: 1 }}
      />
    </ButtonsRow>
  )
}

export default NewWalletButtons
