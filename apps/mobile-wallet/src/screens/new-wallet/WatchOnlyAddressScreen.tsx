import { walletSwitchedMobile } from '@alephium/shared'
import { usePersistQueryClientContext } from '@alephium/shared-react'
import { isValidAddress } from '@alephium/web3'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import i18n from '~/features/localization/i18n'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { createWatchOnlyWallet } from '~/persistent-storage/wallet'
import { cameraToggled } from '~/store/appSlice'
import { walletAddedToList } from '~/store/wallet/walletsSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast, showToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

const instructions: Instruction[] = [
  { text: i18n.t('Watch an address'), type: 'primary' },
  { text: i18n.t('Enter an Alephium address to track its balance and transactions.'), type: 'secondary' }
]

interface WatchOnlyAddressScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'WatchOnlyAddressScreen'>,
    ScreenProps {}

const WatchOnlyAddressScreen = ({ navigation, ...props }: WatchOnlyAddressScreenProps) => {
  const dispatch = useAppDispatch()
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const { t } = useTranslation()
  const { clearQueryCache, restoreQueryCache } = usePersistQueryClientContext()

  const [address, setAddress] = useState('')
  const [name, setName] = useState('')

  const isAddressValid = address.length > 0 && isValidAddress(address)

  const handleCreatePress = async () => {
    if (!isAddressValid || !name) return

    dispatch(activateAppLoading(t('Creating wallet')))

    try {
      const metadata = createWatchOnlyWallet(name, address)

      clearQueryCache()
      await restoreQueryCache(metadata.id)

      dispatch(walletSwitchedMobile(metadata))
      dispatch(walletAddedToList({ id: metadata.id, name, type: 'watch-only', lastUsed: Date.now(), order: 0 }))

      sendAnalytics({ event: 'Created watch-only wallet' })
      resetNavigation(navigation, 'InWalletTabsNavigation')
    } catch (error) {
      showExceptionToast(error, t('Could not create watch-only wallet'))
    } finally {
      dispatch(deactivateAppLoading())
    }
  }

  const handleQRCodeScan = (data: string) => {
    dispatch(cameraToggled(false))

    if (isValidAddress(data)) {
      setAddress(data)
    } else {
      showToast({ text1: t('Invalid address'), type: 'error' })
    }
  }

  return (
    <ScrollScreen
      fill
      contentPaddingTop
      hasKeyboard
      keyboardShouldPersistTaps="always"
      scrollEnabled={false}
      headerOptions={{ type: 'stack' }}
      bottomButtonsRender={() => (
        <>
          <Button
            title={t('Watch')}
            type="primary"
            variant="contrast"
            disabled={!isAddressValid || !name}
            onPress={handleCreatePress}
          />
          <Button title={t('Cancel')} type="secondary" onPress={() => navigation.goBack()} />
        </>
      )}
      {...props}
    >
      <ContentContainer>
        <CenteredInstructions instructions={instructions} />
        <InputsContainer>
          <StyledInput
            label={t('Wallet name')}
            defaultValue={name}
            onChangeText={setName}
            maxLength={24}
            textAlign="center"
          />
          <AddressInputRow>
            <StyledInput
              label={t('Address')}
              defaultValue={address}
              onChangeText={setAddress}
              textAlign="center"
              style={{ flex: 1 }}
              error={address.length > 0 && !isAddressValid ? t('This address is not valid') : undefined}
            />
            <Button
              onPress={() => dispatch(cameraToggled(true))}
              iconProps={{ name: 'scan-outline' }}
              squared
              compact
            />
          </AddressInputRow>
        </InputsContainer>
      </ContentContainer>
      {isCameraOpen && (
        <QRCodeScannerModal onClose={() => dispatch(cameraToggled(false))} onQRCodeScan={handleQRCodeScan} />
      )}
    </ScrollScreen>
  )
}

export default WatchOnlyAddressScreen

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: 50%;
`

const InputsContainer = styled.View`
  margin-top: ${DEFAULT_MARGIN}px;
  width: 80%;
  gap: 10px;
`

const StyledInput = styled(Input)`
  width: 100%;
`

const AddressInputRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`
