import { createAction } from '@reduxjs/toolkit'

import { SnackbarMessageInstance, ToastMessage } from '@/features/toastMessages/toastMessagesTypes'

export const toastDisplayTimeExpired = createAction<SnackbarMessageInstance['id']>('app/toastDisplayTimeExpired')

export const showToast = createAction<ToastMessage>('app/showToast')
