import { NavigationProp, useNavigation } from '@react-navigation/native'
import { createContext, ReactNode, useContext, useState } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { SharedValue } from 'react-native-reanimated'

import { BaseHeaderOptions } from '~/components/headers/BaseHeader'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface HeaderContextValue {
  headerOptions: BaseHeaderOptions
  setHeaderOptions: (options: BaseHeaderOptions) => void
  screenScrollHandler: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
  screenScrollY?: SharedValue<number>
  parentNavigation?: NavigationProp<RootStackParamList>
}

const initialValues: HeaderContextValue = {
  headerOptions: {},
  setHeaderOptions: () => null,
  screenScrollHandler: () => null,
  screenScrollY: undefined,
  parentNavigation: undefined
}

const HeaderContext = createContext(initialValues)

export const HeaderContextProvider = ({ children }: { children: ReactNode }) => {
  const [headerOptions, setHeaderOptions] = useState<HeaderContextValue['headerOptions']>(initialValues.headerOptions)
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const parentNavigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <HeaderContext.Provider
      value={{
        headerOptions,
        setHeaderOptions,
        screenScrollY,
        screenScrollHandler,
        parentNavigation
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => useContext(HeaderContext)
