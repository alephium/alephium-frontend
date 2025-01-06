import { SharedDispatch, SharedRootState } from '@alephium/shared'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// Use throughout your app instead of plain `useDispatch` and `useSelector`.
// See: https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useSharedDispatch = () => useDispatch<SharedDispatch>()
export const useSharedSelector: TypedUseSelectorHook<SharedRootState> = useSelector
