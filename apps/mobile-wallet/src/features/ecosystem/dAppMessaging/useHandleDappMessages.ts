import { MessageType } from '@alephium/wallet-dapp-provider'
import { stringify } from '@alephium/web3'
import { useCallback } from 'react'
import { WebViewMessageEvent } from 'react-native-webview'

import { receivedDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { familiarDappMessageTypes } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { useAppDispatch } from '~/hooks/redux'

const useHandleDappMessages = () => {
  const dispatch = useAppDispatch()

  const handleDappMessage = useCallback(
    (event: WebViewMessageEvent) => {
      // console.log('🆕 RECEIVED EVENT FROM DAPP:', event.nativeEvent.data)

      try {
        const message = JSON.parse(event.nativeEvent.data) as MessageType

        if ('type' in message && familiarDappMessageTypes.includes(message.type)) {
          dispatch(receivedDappMessage(message))
        } else {
          throw new Error(`❌ Invalid message: ${stringify(message)}`)
        }
      } catch (error) {
        // console.error('Error parsing data', error)
      }
    },
    [dispatch]
  )

  return { handleDappMessage }
}

export default useHandleDappMessages
