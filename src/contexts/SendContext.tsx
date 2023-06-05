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

import { createContext, useContext, useState } from 'react'

interface SendContextProps {
  onBack?: () => void
  setOnBack: (cb: () => void) => void
  onContinue?: () => void
  setOnContinue: (cb: () => void) => void
  isContinueEnabled?: boolean
  setIsContinueEnabled: (value: boolean) => void
}

const initialValues: SendContextProps = {
  onBack: () => null,
  setOnBack: () => null,
  onContinue: () => null,
  setOnContinue: () => null,
  isContinueEnabled: false,
  setIsContinueEnabled: () => null
}

const SendContext = createContext(initialValues)

export const SendContextProvider: FC = ({ children }) => {
  const [onBack, setOnBack] = useState<SendContextProps['onBack']>()
  const [onContinue, setOnContinue] = useState<SendContextProps['onContinue']>()
  const [isContinueEnabled, setIsContinueEnabled] = useState<SendContextProps['isContinueEnabled']>()

  return (
    <SendContext.Provider
      value={{ onBack, setOnBack, onContinue, setOnContinue, isContinueEnabled, setIsContinueEnabled }}
    >
      {children}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
