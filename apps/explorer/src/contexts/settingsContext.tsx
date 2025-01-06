import { createContext, ReactNode, useCallback, useContext, useEffect } from 'react'

import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'
import { ThemeType } from '@/styles/themes'
import { OnOff } from '@/types/generics'

export interface SettingsContextValue {
  theme: ThemeType
  switchTheme: (arg0: ThemeType) => void
  timestampPrecisionMode: OnOff
  setTimestampPrecisionMode: (status: OnOff) => void
}

const systemThemeQuery = matchMedia('(prefers-color-scheme: dark)')

//could be `no-preference` so default is `light`'
const currentSystemTheme = () => (systemThemeQuery.matches ? 'dark' : 'light')

const initialSystemTheme: ThemeType = currentSystemTheme()

export const SettingsContext = createContext<SettingsContextValue>({
  theme: initialSystemTheme,
  switchTheme: () => null,
  timestampPrecisionMode: 'off',
  setTimestampPrecisionMode: () => null
})

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useStateWithLocalStorage<ThemeType>('theme', initialSystemTheme)
  const [timestampPrecisionMode, setTimestampPrecisionMode] = useStateWithLocalStorage<OnOff>(
    'timestampPrecisionMode',
    'off'
  )

  const themeHandler = useCallback(() => setThemeName(currentSystemTheme()), [setThemeName])

  useEffect(() => {
    systemThemeQuery.addEventListener('change', themeHandler)
    return () => systemThemeQuery.removeEventListener('change', themeHandler)
  }, [themeHandler])

  return (
    <SettingsContext.Provider
      value={{
        theme: themeName as ThemeType,
        switchTheme: setThemeName as (arg0: ThemeType) => void,
        timestampPrecisionMode,
        setTimestampPrecisionMode
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
