import { createContext, ReactNode, useContext, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

import { BaseHeaderOptions } from '~/components/headers/BaseHeader'

interface HeaderContextValue {
  headerOptions: BaseHeaderOptions
  setHeaderOptions: (options: BaseHeaderOptions) => void
  screenScrollY?: SharedValue<number>
  screenScrollHandler: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const initialValues: HeaderContextValue = {
  headerOptions: {},
  setHeaderOptions: () => null,
  screenScrollY: undefined,
  screenScrollHandler: () => null
}

const HeaderContext = createContext(initialValues)

export const HeaderContextProvider = ({ children }: { children: ReactNode }) => {
  const [headerOptions, setHeaderOptions] = useState<HeaderContextValue['headerOptions']>(initialValues.headerOptions)
  const screenScrollY = useSharedValue(0)

  const screenScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    screenScrollY.value = e.nativeEvent.contentOffset.y
  }

  return (
    <HeaderContext.Provider
      value={{
        headerOptions,
        setHeaderOptions,
        screenScrollY,
        screenScrollHandler
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => useContext(HeaderContext)
