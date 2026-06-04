import { MessageType } from '@alephium/wallet-dapp-provider'
import { createAction } from '@reduxjs/toolkit'

export const receivedDappMessage = createAction<{ message: MessageType; senderHost?: string }>(
  'dAppMessagesQueue/receivedDappMessage'
)
export const respondedToDappMessage = createAction<string>('dAppMessagesQueue/respondedToDappMessage')
export const dAppMessagesQueueCleared = createAction('dAppMessagesQueue/dAppMessagesQueueCleared')
