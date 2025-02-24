import { memo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { StackedToast, StackedToastsContainer } from '@/features/toastMessages/StackedToasts'
import ToastBox from '@/features/toastMessages/ToastBox'
import { toastDisplayTimeExpired } from '@/features/toastMessages/toastMessagesActions'
import { selectAllToastMessages } from '@/features/toastMessages/toastMessagesSelectors'
import { SnackbarMessageInstance } from '@/features/toastMessages/toastMessagesTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const ToastMessages = () => {
  const messages = useAppSelector(selectAllToastMessages)

  if (messages.length === 0) return null

  return (
    <StackedToastsContainer>
      {messages.map((message, index) => (
        <StackedToast key={message.id} index={messages.length - index - 1}>
          <ToastBoxMessage message={message} />
        </StackedToast>
      ))}
    </StackedToastsContainer>
  )
}

export default ToastMessages

const ToastBoxMessage = memo(({ message }: { message: SnackbarMessageInstance }) => {
  const dispatch = useAppDispatch()

  const closeToast = useCallback(() => dispatch(toastDisplayTimeExpired(message.id)), [dispatch, message.id])

  useEffect(() => {
    if (message && message.duration >= 0) {
      const timer = setTimeout(closeToast, message.duration)

      return () => clearTimeout(timer)
    }
  }, [closeToast, message])

  return <ToastBoxStyled type={message.type} onClose={closeToast} title={message.text} />
})

const ToastBoxStyled = styled(ToastBox)`
  width: 100%;
`
