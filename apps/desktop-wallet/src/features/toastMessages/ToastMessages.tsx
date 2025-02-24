import { memo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import ToastBox from '@/features/toastMessages/ToastBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toastDisplayTimeExpired } from '@/storage/global/globalActions'
import { SnackbarMessage } from '@/types/snackbar'

const ToastMessages = () => {
  const messages = useAppSelector((s) => s.toastMessages.messages)

  if (messages.length === 0) return null

  return (
    <ToastMessagesContainer>
      <ToastMessagesStyled>
        {messages.map((message, index) => (
          <ToastBoxMessage key={message.id} message={message} index={messages.length - index - 1} />
        ))}
      </ToastMessagesStyled>
    </ToastMessagesContainer>
  )
}

export default ToastMessages

const ToastBoxMessage = memo(({ message, index }: { message: Required<SnackbarMessage>; index: number }) => {
  const dispatch = useAppDispatch()

  const closeToast = useCallback(() => dispatch(toastDisplayTimeExpired()), [dispatch])

  // Remove snackbar popup after its duration
  useEffect(() => {
    if (message && message.duration >= 0) {
      const timer = setTimeout(closeToast, message.duration)

      return () => clearTimeout(timer)
    }
  }, [closeToast, message])

  return (
    <ToastBoxMessageStyled index={index}>
      <ToastBoxStyled className={message.type} onClose={closeToast} title={message.text} />
    </ToastBoxMessageStyled>
  )
})

const ToastMessagesContainer = styled.div`
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  display: flex;
  justify-content: center;
`

const ToastMessagesStyled = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  pointer-events: auto;
  align-items: center;

  &:hover {
    & > div {
      position: relative;
      transform: none;
      width: 100%;
      opacity: 1;

      & + div {
        margin-bottom: var(--spacing-1);
      }
    }
  }
`

const ToastBoxMessageStyled = styled.div<{ index: number }>`
  position: absolute;
  top: 0;
  width: ${({ index }) => 100 - index * 2}%;
  transform: translateY(${({ index }) => index * 4}px);
  transition: all 0.2s ease;
  opacity: ${({ index }) => 1 - index * 0.1};
`

const ToastBoxStyled = styled(ToastBox)`
  width: 100%;
`
