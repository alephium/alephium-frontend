/*
Copyright 2018 - 2024 The Alephium Authors
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

import { AddressHash, isAddressValid } from '@alephium/shared'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Portal } from 'react-native-portalize'
import { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import Button, { CloseButton, ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContentProps } from '~/components/layout/ModalContent'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen from '~/components/layout/ScrollScreen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { PossibleNextScreenAfterDestination, SendNavigationParamList } from '~/navigation/SendNavigation'
import SelectAddressModal from '~/screens/SendReceive/Send/SelectAddressModal'
import SelectContactModal from '~/screens/SendReceive/Send/SelectContactModal'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { cameraToggled } from '~/store/appSlice'
import { Contact } from '~/types/contacts'
import { validateIsAddressValid } from '~/utils/forms'
import { showToast } from '~/utils/layout'

interface DestinationScreenProps extends StackScreenProps<SendNavigationParamList, 'DestinationScreen'>, ScreenProps {}

type FormData = {
  toAddressHash: AddressHash
}

const requiredErrorMessage = 'This field is required'

const DestinationScreen = ({ navigation, route: { params }, ...props }: DestinationScreenProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { toAddressHash: '' } })
  const theme = useTheme()
  const { setToAddress, setFromAddress, toAddress } = useSendContext()
  const { setHeaderOptions, screenScrollHandler, screenScrollY } = useHeaderContext()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const contacts = useAppSelector(selectAllContacts)
  const dispatch = useAppDispatch()

  const [isContactSelectModalOpen, setIsContactSelectModalOpen] = useState(false)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)
  const shouldFlash = useSharedValue(0)

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const [nextScreen, setNextScreen] = useState<PossibleNextScreenAfterDestination>('OriginScreen')

  const handlePastePress = async () => {
    const text = await Clipboard.getStringAsync()
    setValue('toAddressHash', text)

    sendAnalytics('Send: Pasted destination address')
  }

  const handleQRCodeScan = (addressHash: string) => {
    if (isAddressValid(addressHash)) {
      setValue('toAddressHash', addressHash)

      sendAnalytics('Send: Captured destination address by scanning QR code')
    } else {
      showToast({
        text1: 'Invalid address',
        text2: 'This is not a valid Alephium address: ' + addressHash,
        type: 'error'
      })
    }
  }

  const flashInputBg = () => {
    shouldFlash.value = 1
    setTimeout(() => (shouldFlash.value = 0), 300)
  }

  const handleContactPress = (contactId: Contact['id'], closeModal?: ModalContentProps['onClose']) => {
    const contact = contacts.find((c) => c.id === contactId)

    if (contact) {
      closeModal && closeModal()
      setToAddress(contact.address)
      flashInputBg()

      sendAnalytics('Send: Selected contact to send funds to')
    }
  }

  const handleAddressPress = (addressHash: AddressHash, closeModal?: ModalContentProps['onClose']) => {
    closeModal && closeModal()
    setToAddress(addressHash)
    flashInputBg()

    sendAnalytics('Send: Selected own address to send funds to')
  }

  const handleContinuePress = useCallback(
    (formData: FormData) => {
      setToAddress(formData.toAddressHash)
      navigation.navigate(nextScreen)
    },
    [navigation, nextScreen, setToAddress]
  )

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <CloseButton onPress={() => navigation.goBack()} />,
        headerRight: () => (
          <ContinueButton onPress={handleSubmit(handleContinuePress)} disabled={!!errors.toAddressHash?.message} />
        )
      })
    }, [errors.toAddressHash?.message, handleContinuePress, handleSubmit, navigation, setHeaderOptions])
  )

  useEffect(() => {
    if (params?.fromAddressHash) {
      setFromAddress(params.fromAddressHash)
      setNextScreen('AssetsScreen')
    } else {
      setNextScreen('OriginScreen')
    }
  }, [params?.fromAddressHash, setFromAddress, setToAddress])

  useEffect(() => {
    if (toAddress) {
      setValue('toAddressHash', toAddress)
    }
  }, [setValue, toAddress])

  const inputStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      interpolateColor(shouldFlash.value, [0, 1], [theme.bg.highlight, theme.global.accent]),
      defaultSpringConfiguration
    )
  }))

  return (
    <>
      <ScrollScreen usesKeyboard verticalGap contrastedBg contentPaddingTop onScroll={screenScrollHandler} {...props}>
        <ScreenIntro
          title="Destination"
          subtitle="Send to an address, a contact, or one of your other addresses."
          scrollY={screenScrollY}
        />
        <ScreenSection>
          <Controller
            name="toAddressHash"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Destination address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.toAddressHash?.type === 'required' ? requiredErrorMessage : errors.toAddressHash?.message}
                style={inputStyle}
              />
            )}
            rules={{
              required: true,
              validate: validateIsAddressValid
            }}
            control={control}
          />
        </ScreenSection>
        <ScreenSection>
          <ButtonsRow>
            <Button
              compact
              iconProps={{ name: 'qr-code-outline' }}
              title="Scan"
              onPress={openQRCodeScannerModal}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'copy-outline' }}
              title="Paste"
              onPress={handlePastePress}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'person-outline' }}
              title="Contacts"
              onPress={() => setIsContactSelectModalOpen(true)}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'bookmarks-outline' }}
              title="Addresses"
              onPress={() => setIsAddressSelectModalOpen(true)}
              variant="accent"
              type="secondary"
            />
          </ButtonsRow>
        </ScreenSection>
        {isCameraOpen && (
          <QRCodeScannerModal
            onClose={closeQRCodeScannerModal}
            onQRCodeScan={handleQRCodeScan}
            text="Scan an Alephium address QR code"
          />
        )}
      </ScrollScreen>

      <Portal>
        <BottomModal
          isOpen={isContactSelectModalOpen}
          Content={(props) => (
            <SelectContactModal
              onContactPress={(contactId) => handleContactPress(contactId, props.onClose)}
              onNewContactPress={() => {
                props.onClose && props.onClose()
                navigation.navigate('NewContactScreen')
              }}
              {...props}
            />
          )}
          onClose={() => setIsContactSelectModalOpen(false)}
        />

        <BottomModal
          isOpen={isAddressSelectModalOpen}
          Content={(props) => (
            <SelectAddressModal
              onAddressPress={(addressHash) => handleAddressPress(addressHash, props.onClose)}
              {...props}
            />
          )}
          onClose={() => setIsAddressSelectModalOpen(false)}
          maximisedContent
        />
      </Portal>
    </>
  )
}

export default DestinationScreen

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 15px;
  flex-wrap: wrap;
`
