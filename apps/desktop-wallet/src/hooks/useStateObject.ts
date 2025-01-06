import { Dispatch, SetStateAction, useCallback, useState } from 'react'

type Setter<T> = Dispatch<SetStateAction<T>>
type SetterSingle = (name: string) => (value: unknown) => void

const useStateObject = <T>(initialObj: T): [T, Setter<T>, SetterSingle] => {
  const [obj, setObj] = useState<T>(initialObj)

  const setObjProps = useCallback(
    (name: string) => (value: unknown) => {
      const nObj = Object.assign({}, obj, { [name]: value })
      setObj(nObj)
    },
    [obj, setObj]
  )

  return [obj, setObj, setObjProps]
}

export default useStateObject
