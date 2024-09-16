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

import { Children, isValidElement, ReactNode, useEffect } from 'react'
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import { selectAllModals } from '~/features/modals/modalSelectors'
import { getModalComponent } from '~/features/modals/modalTypes'
import { getElementName, isModalWrapped } from '~/features/modals/modalUtils'
import { useAppSelector } from '~/hooks/redux'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)

  return (
    <ModalsContainer pointerEvents={openedModals.length > 0 ? 'auto' : 'none'}>
      {openedModals.map((modal) => {
        const ModalComponent = getModalComponent(modal.params.name)

        return <ModalComponent key={modal.id} id={modal.id} {...(modal.params.props || {})} />
      })}
    </ModalsContainer>
  )
}

interface ModalsContainerProps {
  children: ReactNode
}

const ModalsContainer = ({ children, ...props }: ModalsContainerProps & ViewProps) => {
  useEffect(() => {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && !isModalWrapped(child)) {
        console.warn(
          `Warning: ${getElementName(child)} is not wrapped! Please wrap it with the withModalWrapper function.`
        )
      }
    })
  }, [children])

  return <ModalsContainerStyled {...props}>{children}</ModalsContainerStyled>
}

export default AppModals

const ModalsContainerStyled = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
