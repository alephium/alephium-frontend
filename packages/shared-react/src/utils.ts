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

import { isValidElement, memo, ReactElement } from 'react'

const memoizedFn = memo(() => null)

export const isElementMemoized = <P>(element: ReactElement<P>): boolean => {
  if (!isValidElement(element)) return false

  const elementType = element.type as unknown as { $$typeof?: symbol }

  return !!elementType.$$typeof && elementType.$$typeof === (memoizedFn as unknown as { $$typeof: symbol }).$$typeof
}

export const getElementName = <P>(element: ReactElement<P>): string => {
  const elementType = element.type as React.ComponentType<P>

  return elementType.displayName || elementType.name || 'Component'
}
