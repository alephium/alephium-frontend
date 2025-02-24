import { createAction } from '@reduxjs/toolkit'

import { Message } from '@/features/toastMessages/toastMessagesTypes'

export const walletConnectPairingFailed = createAction<Message>('dApps/walletConnectPairingFailed')

export const walletConnectProposalApprovalFailed = createAction<Message>('dApps/walletConnectProposalApprovalFailed')

export const walletConnectProposalValidationFailed = createAction<Message>(
  'dApps/walletConnectProposalValidationFailed'
)
