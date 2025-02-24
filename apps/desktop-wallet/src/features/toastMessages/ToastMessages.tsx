import { memo, useCallback, useEffect } from 'react'

import ToastBox from '@/features/toastMessages/ToastBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toastDisplayTimeExpired } from '@/storage/global/globalActions'
import { SnackbarMessage } from '@/types/snackbar'

const ToastMessages = () => {
  const messages = useAppSelector((s) => s.toastMessages.messages)

  if (messages.length === 0) return null

  return messages.map((message) => <ToastBoxMessage key={message.id} message={message} />)
}

export default ToastMessages

const ToastBoxMessage = memo(({ message }: { message: Required<SnackbarMessage> }) => {
  const dispatch = useAppDispatch()

  const closeToast = useCallback(() => dispatch(toastDisplayTimeExpired()), [dispatch])

  // Remove snackbar popup after its duration
  useEffect(() => {
    if (message && message.duration >= 0) {
      const timer = setTimeout(closeToast, message.duration)

      return () => clearTimeout(timer)
    }
  }, [closeToast, message])

  return <ToastBox className={message.type} onClose={closeToast} title={message.text} />
})
