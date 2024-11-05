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

import { AddressHash, Contact } from '@alephium/shared'
import { isValidAddress } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { PossibleNextScreenAfterDestination, SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { cameraToggled } from '~/store/appSlice'
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
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const contacts = useAppSelector(selectAllContacts)
  const { screenScrollHandler } = useHeaderContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const shouldFlash = useSharedValue(0)

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const [nextScreen, setNextScreen] = useState<PossibleNextScreenAfterDestination>('OriginScreen')

  const handlePastePress = async () => {
    const text = await Clipboard.getStringAsync()
    setValue('toAddressHash', text)

    sendAnalytics({ event: 'Send: Pasted destination address' })
  }

  const handleQRCodeScan = (addressHash: string) => {
    if (isValidAddress(addressHash)) {
      setValue('toAddressHash', addressHash)

      sendAnalytics({ event: 'Send: Captured destination address by scanning QR code' })
    } else {
      showToast({
        text1: t('Invalid address'),
        text2: `${t('This is not a valid Alephium address')}: ${addressHash}`,
        type: 'error'
      })
    }
  }

  const flashInputBg = () => {
    shouldFlash.value = 1
    setTimeout(() => (shouldFlash.value = 0), 300)
  }

  const handleContactPress = (contactId: Contact['id']) => {
    const contact = contacts.find((c) => c.id === contactId)

    if (contact) {
      setToAddress(contact.address)
      flashInputBg()

      sendAnalytics({ event: 'Send: Selected contact to send funds to' })
    }
  }

  const handleAddressPress = (addressHash: AddressHash) => {
    setToAddress(addressHash)
    flashInputBg()

    sendAnalytics({ event: 'Send: Selected own address to send funds to' })
  }

  const openAddressSelectModal = () =>
    dispatch(openModal({ name: 'SelectAddressModal', props: { onAddressPress: handleAddressPress } }))

  const handleContinuePress = useCallback(
    (formData: FormData) => {
      setToAddress(formData.toAddressHash)
      navigation.navigate(nextScreen)
    },
    [navigation, nextScreen, setToAddress]
  )

  const openSelectContactModal = () =>
    dispatch(
      openModal({
        name: 'SelectContactModal',
        props: {
          onContactPress: handleContactPress,
          onNewContactPress: () => {
            navigation.navigate('NewContactScreen')
          }
        }
      })
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
      <ScrollScreen
        verticalGap
        contentPaddingTop
        screenTitle={t('Destination')}
        screenIntro={t('Send to an address, a contact, or one of your other addresses.')}
        onScroll={screenScrollHandler}
        fill
        {...props}
      >
        <ScreenSection>
          <Controller
            name="toAddressHash"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('Destination address')}
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
              iconProps={{ name: 'maximize' }}
              title={t('Scan')}
              onPress={openQRCodeScannerModal}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'copy' }}
              title={t('Paste')}
              onPress={handlePastePress}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'user' }}
              title={t('Contacts')}
              onPress={openSelectContactModal}
              variant="accent"
              type="secondary"
            />
            <Button
              compact
              iconProps={{ name: 'bookmark' }}
              title={t('Addresses')}
              onPress={openAddressSelectModal}
              variant="accent"
              type="secondary"
            />
          </ButtonsRow>
        </ScreenSection>
        {isCameraOpen && (
          <QRCodeScannerModal
            onClose={closeQRCodeScannerModal}
            onQRCodeScan={handleQRCodeScan}
            text={t('Scan an Alephium address QR code')}
          />
        )}
      </ScrollScreen>
      <BottomButtons bottomInset>
        <Button title={t('Continue')} variant="highlight" onPress={handleSubmit(handleContinuePress)} />
      </BottomButtons>
    </>
  )
}

export default DestinationScreen

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 15px;
  flex-wrap: wrap;
`
