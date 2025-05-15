import { AddressHash, Contact } from '@alephium/shared'
import { isValidAddress } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'
import { isAddress as isEthereumAddress } from 'web3-validator'

import { sendAnalytics } from '~/analytics'
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
import { VERTICAL_GAP } from '~/style/globalStyle'
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
  const { setToAddress, setFromAddress, toAddress } = useSendContext()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const contacts = useAppSelector(selectAllContacts)
  const { screenScrollHandler } = useHeaderContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const [nextScreen, setNextScreen] = useState<PossibleNextScreenAfterDestination>('OriginScreen')

  const handleQRCodeScan = (addressHash: string) => {
    if (isValidAddress(addressHash)) {
      setValue('toAddressHash', addressHash)

      sendAnalytics({ event: 'Send: Captured destination address by scanning QR code' })
    } else if (isEthereumAddress(addressHash)) {
      showToast({
        text1: t('You scanned an Ethereum address'),
        text2: t('To move funds to Ethereum use the bridge at {{ url }}', { url: 'https://bridge.alephium.org' }),
        onPress: () => Linking.openURL('https://bridge.alephium.org'),
        type: 'error'
      })
    } else {
      showToast({
        text1: t('Invalid address'),
        text2: `${t('This is not a valid Alephium address.')} ${t(
          'Make sure you are not scanning an address of a different chain.'
        )}`,
        type: 'error'
      })
    }
  }

  const handleContactPress = (contactId: Contact['id']) => {
    const contact = contacts.find((c) => c.id === contactId)

    if (contact) {
      setToAddress(contact.address)

      sendAnalytics({ event: 'Send: Selected contact to send funds to' })
    }
  }

  const handleAddressPress = (addressHash: AddressHash) => {
    setToAddress(addressHash)

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
        props: { onContactPress: handleContactPress }
      })
    )

  useEffect(() => {
    if (params?.originAddressHash) {
      setFromAddress(params.originAddressHash)
      setNextScreen('AddressTokensScreen')
    } else {
      setNextScreen('OriginScreen')
    }
  }, [params.originAddressHash, setFromAddress])

  useEffect(() => {
    if (toAddress) {
      setValue('toAddressHash', toAddress)
    }
  }, [setValue, toAddress])

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop={insets.top + VERTICAL_GAP * 2} // TODO: avoid manual override by simplifying setting screens padding top
      screenTitle={t('Destination')}
      screenIntro={t('Send to an address, a contact, or one of your other addresses.')}
      onScroll={screenScrollHandler}
      fill
      hasKeyboard
      bottomButtonsRender={() => (
        <Button title={t('Continue')} variant="highlight" onPress={handleSubmit(handleContinuePress)} />
      )}
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
              showPasteButton
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
          />
          <Button
            compact
            iconProps={{ name: 'user' }}
            title={t('Contacts')}
            onPress={openSelectContactModal}
            variant="accent"
          />
          <Button
            compact
            iconProps={{ name: 'bookmark' }}
            title={t('Addresses')}
            onPress={openAddressSelectModal}
            variant="accent"
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
  )
}

export default DestinationScreen

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 15px;
`
