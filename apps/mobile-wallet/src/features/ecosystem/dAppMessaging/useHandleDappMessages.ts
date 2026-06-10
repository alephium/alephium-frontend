import { useCallback } from 'react'
import type { WebViewMessageEvent } from 'react-native-webview'

import { sendAnalytics } from '~/analytics'
import { receivedDappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { parseIncomingWebViewDappMessageEvent } from '~/features/ecosystem/dAppMessaging/incomingDappMessage'
import { useAppDispatch } from '~/hooks/redux'

const useHandleDappMessages = () => {
  const dispatch = useAppDispatch()

  const handleDappMessage = useCallback(
    (event: WebViewMessageEvent) => {
      // console.log('🆕 RECEIVED EVENT FROM DAPP:', event.nativeEvent.data)
      const parsed = parseIncomingWebViewDappMessageEvent(event)

      if (!parsed) return

      if (parsed.claimedHost && parsed.senderHost && parsed.claimedHost !== parsed.senderHost) {
        console.warn(`dApp host mismatch — claimed "${parsed.claimedHost}", real origin "${parsed.senderHost}"`)
        sendAnalytics({ event: 'dApp host mismatch detected', props: { claimedHost: parsed.claimedHost } })
      }

      dispatch(receivedDappMessage({ message: parsed.message, senderHost: parsed.senderHost }))
    },
    [dispatch]
  )

  return { handleDappMessage }
}

export default useHandleDappMessages
