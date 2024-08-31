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

import { AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

import { selectModalState } from '@/features/modals/modalSelectors'
import { ModalName } from '@/features/modals/modalTypes'
import { useAppSelector } from '@/hooks/redux'

interface LazyModalRendererProps {
  name: ModalName
  children: JSX.Element
}

const LazyModalRenderer = ({ name, children }: LazyModalRendererProps): ReactNode => {
  const modalState = useAppSelector((s) => selectModalState(s, name))

  // Avoid doing any work until the modal needs to be open
  return <AnimatePresence>{modalState.isOpen ? children : false}</AnimatePresence>
}

export default LazyModalRenderer
