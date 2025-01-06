import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '~/store/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`.
// See: https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
