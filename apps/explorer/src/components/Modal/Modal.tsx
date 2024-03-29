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
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import styled from 'styled-components'

import { deviceBreakPoints } from '@/styles/globalStyles'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  maxWidth?: number
}

const Modal = ({ isOpen = false, onClose, children, className, maxWidth = 600 }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <ModalWrapper>
        <Backdrop
          onClick={onClose}
          initial={{ WebkitBackdropFilter: 'blur(0px)', backdropFilter: 'blur(0px)', opacity: 0 }}
          animate={{ WebkitBackdropFilter: 'blur(3px)', backdropFilter: 'blur(3px)', opacity: 1 }}
          exit={{ WebkitBackdropFilter: 'blur(0px)', backdropFilter: 'blur(0px)', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 310, damping: 30 }}
        />
        <ModalContentWrapper
          initial={{ opacity: 0, x: '10%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '10%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 40 }}
          className={className}
          style={{ maxWidth }}
        >
          <CloseButton onClick={onClose}>
            <RiCloseLine />
          </CloseButton>
          <ModalChildrenContainer>{children}</ModalChildrenContainer>
        </ModalContentWrapper>
      </ModalWrapper>
    )}
  </AnimatePresence>
)

export default Modal

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 900;
`

const ModalContentWrapper = styled(motion.div)`
  position: absolute;
  display: flex;
  right: 25px;
  top: 25px;
  bottom: 25px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  overflow-y: auto;
  z-index: 1;
  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  overflow: hidden;

  min-width: 400px;

  @media ${deviceBreakPoints.mobile} {
    min-width: auto;
  }

  @media ${deviceBreakPoints.mobile} {
    right: 5%;
    left: 5%;
  }
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: ${({ theme }) => colord(theme.bg.tertiary).alpha(0.5).toHslString()};
`

const CloseButton = styled(RiCloseLine)`
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  height: 32px;
  width: 32px;
  color: ${({ theme }) => theme.font.primary};
  border-radius: 30px;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 5px;

  :hover {
    color: ${({ theme }) => theme.font.secondary};
  }
`

const ModalChildrenContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`
