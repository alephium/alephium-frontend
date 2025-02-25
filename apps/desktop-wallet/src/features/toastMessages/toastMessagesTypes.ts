export type Message = string

export type OptionalMessage = Message | undefined

export type ToastType = 'info' | 'success' | 'error'

export interface SnackbarMessage {
  text: Message
  type?: ToastType
  duration?: number
}

export interface ToastMessage extends Omit<SnackbarMessage, 'duration'> {
  duration: 'short' | 'long'
}

export type SnackbarMessageInstance = Required<SnackbarMessage> & { id: number }
