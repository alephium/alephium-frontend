/*
Copyright 2018 - 2023 The Alephium Authors
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

import { createContext, ReactNode, useContext, useState } from 'react'

import { BaseHeaderOptions } from '~/components/headers/BaseHeader'

interface HeaderContextValue {
  headerOptions: BaseHeaderOptions
  setHeaderOptions: (options: BaseHeaderOptions) => void
}

const initialValues: HeaderContextValue = {
  headerOptions: {},
  setHeaderOptions: () => null
}

const HeaderContext = createContext(initialValues)

export const HeaderContextProvider = ({ children }: { children: ReactNode }) => {
  const [headerOptions, setHeaderOptions] = useState<HeaderContextValue['headerOptions']>(initialValues.headerOptions)

  return (
    <HeaderContext.Provider
      value={{
        headerOptions,
        setHeaderOptions
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => useContext(HeaderContext)
