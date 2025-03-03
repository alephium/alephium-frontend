import { ActivityIndicator } from 'react-native'
import { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import WalletConnectSVG from '~/images/logos/WalletConnectLogo'
import { cameraToggled } from '~/store/appSlice'

const WalletConnectButton = () => {
  const theme = useTheme()
  const walletConnectClientStatus = useAppSelector((s) => s.clients.walletConnect.status)
  const { activeSessions } = useWalletConnectContext()
  const dispatch = useAppDispatch()

  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const openWalletConnectErrorModal = () => dispatch(openModal({ name: 'WalletConnectErrorModal' }))
  const onpenWalletConnectPairingsModal = () =>
    dispatch(
      openModal({
        name: 'WalletConnectPairingsModal',
        props: { onPasteWcUrlPress: openWalletConnectPasteUrlModal, onScanQRCodePress: openQRCodeScannerModal }
      })
    )
  const openWalletConnectPasteUrlModal = () => dispatch(openModal({ name: 'WalletConnectPasteUrlModal' }))

  return walletConnectClientStatus === 'initialization-failed' ? (
    <Button
      variant="alert"
      onPress={openWalletConnectErrorModal}
      customIcon={<WalletConnectSVG width={18} color={theme.global.alert} />}
      squared
      compact
    />
  ) : walletConnectClientStatus === 'initialized' ? (
    <Button
      onPress={onpenWalletConnectPairingsModal}
      style={activeSessions.length ? { backgroundColor: '#3B99FC' } : undefined}
      customIcon={<WalletConnectSVG width={18} color={activeSessions.length ? 'white' : theme.font.secondary} />}
      squared
      compact
    />
  ) : (
    <Button
      style={{ width: 80 }}
      customIcon={
        <>
          <WalletConnectSVG width={18} color={theme.font.secondary} />
          <ActivityIndicator size={16} color={theme.font.tertiary} />
        </>
      }
      squared
    />
  )
}

export default WalletConnectButton
