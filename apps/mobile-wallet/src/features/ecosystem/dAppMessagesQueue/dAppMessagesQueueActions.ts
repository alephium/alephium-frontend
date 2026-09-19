import { MessageType } from '@alephium/wallet-dapp-provider'
import { createAction } from '@reduxjs/toolkit'

// The queue sorts by id and processes the front, so ids must be unique and keep sorting in arrival order.
let lastDappMessageId = 0
const getNextDappMessageId = () => (++lastDappMessageId).toString().padStart(10, '0')

export const receivedDappMessage = createAction(
  'dAppMessagesQueue/receivedDappMessage',
  (payload: { message: MessageType; senderHost?: string }) => ({
    payload: { ...payload, id: getNextDappMessageId() }
  })
)
export const respondedToDappMessage = createAction<string>('dAppMessagesQueue/respondedToDappMessage')
export const dAppMessagesQueueCleared = createAction('dAppMessagesQueue/dAppMessagesQueueCleared')
