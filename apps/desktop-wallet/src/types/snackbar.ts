export type Message = string

export type OptionalMessage = Message | undefined

export interface SnackbarMessage {
  text: Message
  type?: 'info' | 'alert' | 'success'
  duration?: number
}

export interface ToastMessage extends Omit<SnackbarMessage, 'duration'> {
  duration: 'short' | 'long'
}
