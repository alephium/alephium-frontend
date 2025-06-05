import { ConnectDappMessageData, MessageType, RequestOptions } from '@alephium/wallet-dapp-provider'
import { useCallback, useRef } from 'react'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

import {
  connectionAuthorized,
  connectionRemoved
} from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import {
  getAuthorizedConnection,
  isConnectionAuthorized
} from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import useGetConnectedAddressPayload from '~/features/ecosystem/dAppMessaging/useGetAddressNonSensitiveInfo'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

interface UseHandleDappMessagesProps {
  dAppName: string
}

const useHandleDappMessages = ({ dAppName }: UseHandleDappMessagesProps) => {
  const webViewRef = useRef<WebView>(null)
  const dispatch = useAppDispatch()

  const { getConnectedAddressPayload } = useGetConnectedAddressPayload()

  const handleIsDappPreauthorized = useCallback((data: RequestOptions) => {
    const isPreauthorized = isConnectionAuthorized(data)

    console.log('✈️ Replying with ALPH_IS_PREAUTHORIZED_RES:', isPreauthorized)
    webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_IS_PREAUTHORIZED_RES', data: isPreauthorized }))
  }, [])

  const handleRejectDappConnection = useCallback(() => {
    console.log('✈️ Replying with ALPH_REJECT_PREAUTHORIZATION')
    webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_REJECT_PREAUTHORIZATION' }))
  }, [])

  const handleRemovePreAuthorization = useCallback(
    (host: string) => {
      dispatch(connectionRemoved(host))

      console.log('✈️ Replying with ALPH_REMOVE_PREAUTHORIZATION_RES')
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_REMOVE_PREAUTHORIZATION_RES' }))
    },
    [dispatch]
  )

  const handleApproveDappConnection = useCallback(
    (data: ConnectedAddressPayload) => {
      dispatch(connectionAuthorized(data))
      console.log('✈️ Replying with ALPH_CONNECT_DAPP_RES', data)
      webViewRef.current?.postMessage(JSON.stringify({ type: 'ALPH_CONNECT_DAPP_RES', data }))
    },
    [dispatch]
  )

  const handleConnectDapp = useCallback(
    async (data: ConnectDappMessageData) => {
      const authorizedConnection = getAuthorizedConnection(data)

      if (!authorizedConnection) {
        dispatch(
          openModal({
            name: 'ConnectDappModal',
            props: {
              ...data,
              dAppName,
              onReject: handleRejectDappConnection,
              onApprove: handleApproveDappConnection
            }
          })
        )
      } else {
        const connectedAddressPayload = await getConnectedAddressPayload({
          addressStr: authorizedConnection.address,
          host: data.host,
          keyType: data.keyType
        })

        if (!connectedAddressPayload) return

        handleApproveDappConnection(connectedAddressPayload)
      }
    },
    [dAppName, dispatch, getConnectedAddressPayload, handleApproveDappConnection, handleRejectDappConnection]
  )

  const handleDappMessage = useCallback(
    (event: WebViewMessageEvent) => {
      console.log('🆕 RECEIVED EVENT FROM DAPP:', event.nativeEvent.data)

      try {
        const message = JSON.parse(event.nativeEvent.data) as MessageType
        if (!('type' in message)) throw new Error('Invalid message')

        switch (message.type) {
          case 'ALPH_IS_PREAUTHORIZED':
            handleIsDappPreauthorized(message.data)
            break
          case 'ALPH_REMOVE_PREAUTHORIZATION':
            handleRemovePreAuthorization(message.data)
            break
          case 'ALPH_CONNECT_DAPP':
            handleConnectDapp(message.data)
            break
          default:
            console.log('🚨 Unknown message type:', message.type)
            break
        }
      } catch (error) {
        console.error('Error parsing data', error)
      }
    },
    [handleConnectDapp, handleIsDappPreauthorized, handleRemovePreAuthorization]
  )

  return { webViewRef, handleDappMessage }
}

export default useHandleDappMessages
