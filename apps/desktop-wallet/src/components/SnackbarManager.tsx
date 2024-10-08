/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { memo, useEffect } from 'react'
import styled, { css } from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import { snackbarDisplayTimeExpired } from '@/storage/global/globalActions'
import { deviceBreakPoints, walletSidebarWidthPx } from '@/style/globalStyles'
import { SnackbarMessage } from '@/types/snackbar'

const SnackbarManager = () => {
  const messages = useAppSelector((state) => state.snackbar.messages)

  return (
    <ModalPortal>
      {messages.length > 0 && (
        <SnackbarManagerContainer>
          {messages.map((message) => (
            <SnackbarPopup key={message.id} message={message} />
          ))}
        </SnackbarManagerContainer>
      )}
    </ModalPortal>
  )
}

export default SnackbarManager

const SnackbarPopup = memo(({ message }: { message: Required<SnackbarMessage> }) => {
  const dispatch = useAppDispatch()

  // Remove snackbar popup after its duration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (message && message.duration >= 0) {
      timer = setTimeout(() => dispatch(snackbarDisplayTimeExpired()), message.duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [dispatch, message])

  return (
    <SnackbarPopupStyled {...fadeInBottom} {...fadeOut} className={message.type} style={{ textAlign: 'center' }}>
      <Message>{message.text}</Message>
    </SnackbarPopupStyled>
  )
})

export const getSnackbarStyling = (color: string) => css`
  background-color: ${colord(color).alpha(0.9).toHex()};
  border: 1px solid ${colord(color).lighten(0.1).toHex()};
  color: rgba(255, 255, 255, 0.8);
`

export const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: ${walletSidebarWidthPx}px;
  z-index: 2;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

export const SnackbarPopupStyled = styled(motion.div)`
  margin: var(--spacing-3);
  min-width: 200px;
  padding: var(--spacing-4) var(--spacing-3);
  color: ${({ theme }) => theme.font.primary};
  border-radius: var(--radius-medium);
  backdrop-filter: blur(10px);
  max-width: 800px;
  word-wrap: break-word;
  overflow-y: auto;

  &.alert {
    ${({ theme }) => getSnackbarStyling(theme.global.alert)}
  }

  &.info {
    ${({ theme }) =>
      theme.name === 'light' ? getSnackbarStyling(theme.bg.contrast) : getSnackbarStyling(theme.bg.background2)}
  }

  &.success {
    ${({ theme }) => getSnackbarStyling(theme.global.valid)}
  }
`

const Message = styled.div`
  max-height: 20vh;
`
