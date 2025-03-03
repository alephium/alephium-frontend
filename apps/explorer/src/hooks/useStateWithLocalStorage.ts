import { useEffect, useState } from 'react'

const useStateWithLocalStorage = <T extends string>(localStorageKey: string, defaultValue: T) => {
  const [value, setValue] = useState(localStorage.getItem(localStorageKey) || defaultValue)

  useEffect(() => {
    localStorage.setItem(localStorageKey, value)
  }, [localStorageKey, value])

  return [value as T, setValue] as const
}

export default useStateWithLocalStorage
