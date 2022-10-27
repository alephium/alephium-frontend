/*
Copyright 2018 - 2022 The Alephium Authors
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
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  maxWidth?: number
}

const Modal = ({ isOpen = false, onClose, children, className, maxWidth = 600 }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div>
        <Backdrop
          onClick={onClose}
          initial={{ backdropFilter: 'blur(0px)', opacity: 0 }}
          animate={{ backdropFilter: 'blur(5px)', opacity: 1 }}
          exit={{ backdropFilter: 'blur(0px)', opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
        <ModalContentWrapper
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.1 }}
          className={className}
          style={{ maxWidth }}
        >
          {children}
        </ModalContentWrapper>
      </div>
    )}
  </AnimatePresence>
)

export default Modal

const ModalContentWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bgSecondary};
  height: 50vh;
  min-height: 500px;
  overflow-y: auto;
  z-index: 1000;
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: ${({ theme }) => colord(theme.bgTertiary).alpha(0.9).toHslString()};
  z-index: 900;
`
