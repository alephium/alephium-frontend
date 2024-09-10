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

import { Children, isValidElement, memo, ReactElement, ReactNode, useEffect } from 'react'
import { ViewProps } from 'react-native'
import styled from 'styled-components/native'

import BackupReminderModal from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordReminderModal from '~/features/fund-password/FundPasswordReminderModal'
import { selectAllModals } from '~/features/modals/modalSelectors'
import { useAppSelector } from '~/hooks/redux'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)

  if (openedModals.length === 0) return null

  return (
    <ModalsContainer pointerEvents={openedModals.length > 0 ? 'auto' : 'none'}>
      {openedModals.map((modal) => {
        switch (modal.params.name) {
          case 'BuyModal':
            return <BuyModal id={modal.id} key={modal.id} />
          case 'FundPasswordReminderModal':
            return <FundPasswordReminderModal id={modal.id} key={modal.id} />
          case 'BackupReminderModal':
            return <BackupReminderModal id={modal.id} key={modal.id} {...modal.params.props} />
          default:
            return null
        }
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
      if (isValidElement(child) && !isElementMemoized(child)) {
        console.warn(`Warning: ${getElementName(child)} is not memoized! Please wrap it with React.memo().`)
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

// TODO: Use functions defined in shared-react 👇

const memoizedFn = memo(() => null)

const isElementMemoized = <P,>(element: ReactElement<P>): boolean => {
  if (!isValidElement(element)) return false

  const elementType = element.type as unknown as { $$typeof?: symbol }

  return !!elementType.$$typeof && elementType.$$typeof === (memoizedFn as unknown as { $$typeof: symbol }).$$typeof
}

const getElementName = <P,>(element: ReactElement<P>): string => {
  const elementType = element.type as React.ComponentType<P>

  return elementType.displayName || elementType.name || 'Component'
}
