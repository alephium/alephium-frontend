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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as Clipboard from 'expo-clipboard'
import { ClipboardIcon, LucideProps, Scan } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { PressableProps, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { BackButton, ContinueButton } from '~/screens/Send/SendScreenHeader'
import SendScreenIntro from '~/screens/Send/SendScreenIntro'
import { AddressHash } from '~/types/addresses'
import { validateIsAddressValid } from '~/utils/forms'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'DestinationScreen'> {
  style?: StyleProp<ViewStyle>
}

type FormData = {
  toAddressHash: AddressHash
}

const requiredErrorMessage = 'This field is required'

const DestinationScreen = ({ navigation, style }: ScreenProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { toAddressHash: '' } })
  const { setToAddress } = useSendContext()

  const onContinue = (formData: FormData) => {
    setToAddress(formData.toAddressHash)
    navigation.navigate('OriginScreen')
  }

  const onPasteClick = async () => {
    const text = await Clipboard.getStringAsync()
    setValue('toAddressHash', text)
  }

  useFocusEffect(() => {
    navigation.getParent()?.setOptions({
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => <ContinueButton onPress={handleSubmit(onContinue)} />
    })
  })

  return (
    <ScrollScreen style={style}>
      <SendScreenIntro
        title="Destination"
        subtitle="Send to a custom address, a contact, or one of you other addresses."
      />
      <ScreenSection>
        <BoxSurface>
          <Controller
            name="toAddressHash"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Destination address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.toAddressHash?.type === 'required' ? requiredErrorMessage : errors.toAddressHash?.message}
              />
            )}
            rules={{
              required: true,
              validate: validateIsAddressValid
            }}
            control={control}
          />
        </BoxSurface>
      </ScreenSection>
      <ScreenSection>
        <ButtonsRow>
          <Button Icon={Scan} title="Scan" />
          <Button Icon={ClipboardIcon} title="Paste" onPress={onPasteClick} />
        </ButtonsRow>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default DestinationScreen

// TODO: Move to new cleaned-up Buttons component
interface ButtonProps extends PressableProps {
  title: string
  Icon?: (props: LucideProps) => JSX.Element
}

const Button: FC<ButtonProps> = ({ Icon, title, children, ...props }) => {
  const theme = useTheme()

  return (
    <ButtonStyled {...props}>
      {Icon && <Icon size={20} color={theme.global.accent} />}
      <AppText semiBold color="accent">
        {title}
      </AppText>
      {children}
    </ButtonStyled>
  )
}

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 15px;
`

const ButtonStyled = styled.Pressable`
  padding: 7px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 26px;
  align-items: center;
  flex-direction: row;
  gap: 5px;
`
