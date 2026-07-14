import { getHostFromUrl } from '@alephium/shared/utils'
import type { MessageType } from '@alephium/wallet-dapp-provider'
import type { WebViewMessageEvent } from 'react-native-webview'

import { familiarDappMessageTypes } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'

export interface ParsedDappMessage {
  message: MessageType
  senderHost?: string // The real origin of the page that sent the message, read natively from the WebView event URL.
  claimedHost?: string // The untrusted host the page claimed inside the message body.
}

// Validates a message posted by a page through the WebView bridge and binds it to its real origin.
export const parseIncomingWebViewDappMessageEvent = (event: WebViewMessageEvent): ParsedDappMessage | null => {
  let parsed: unknown

  try {
    parsed = JSON.parse(event.nativeEvent.data)
  } catch (error) {
    console.error('Error parsing data:', error)
    return null
  }

  if (!parsed || typeof parsed !== 'object' || !('type' in parsed)) return null

  const message = parsed as MessageType

  if (!familiarDappMessageTypes.includes(message.type)) return null

  return {
    message,
    senderHost: getHostFromUrl(event.nativeEvent.url),
    claimedHost: getClaimedHost(message)
  }
}

const getClaimedHost = (message: MessageType): string | undefined => {
  const data = 'data' in message ? message.data : undefined

  if (data && typeof data === 'object' && 'host' in data) {
    const host = data.host

    return typeof host === 'string' ? host : undefined
  }

  return undefined
}
