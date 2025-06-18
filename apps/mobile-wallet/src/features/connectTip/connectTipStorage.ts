import { storage } from '~/persistent-storage/storage'

const CONNECT_TIP_SHOWN_ONCE_KEY = 'connectTipShownOnce'

export const isConnectTipShownOnce = () => storage.getBoolean(CONNECT_TIP_SHOWN_ONCE_KEY)

export const setConnectTipShownOnce = () => storage.set(CONNECT_TIP_SHOWN_ONCE_KEY, true)
