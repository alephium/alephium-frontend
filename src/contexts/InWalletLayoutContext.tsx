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

import { createContext, ReactNode, useContext } from 'react'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

// This is done so that the scrollY position of the screen's ScrollView can be passed to the DefaultHeader and
// FooterMenu components so they can react to scrolling.

interface InWalletLayoutContextProps {
  scrollY?: SharedValue<number>
}

const InWalletLayoutContext = createContext<InWalletLayoutContextProps>({
  scrollY: undefined
})

export const InWalletLayoutContextProvider = ({ children }: { children: ReactNode }) => {
  const scrollY = useSharedValue(0)

  return <InWalletLayoutContext.Provider value={{ scrollY }}>{children}</InWalletLayoutContext.Provider>
}

export const useInWalletLayoutContext = () => useContext(InWalletLayoutContext)

export default InWalletLayoutContext
