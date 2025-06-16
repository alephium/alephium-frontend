import { AlephiumWindowObject, providerInitializedEvent } from '@alephium/get-extension-wallet'
import isPlainObject from 'lodash.isplainobject'
import { MessageType } from 'src/types/messages'

import { alephiumWindowObject } from './alephiumWindowObject'

const INJECT_NAMES = ['alephium']

declare global {
  interface Window {
    // Inspired by EIP-5749: https://eips.ethereum.org/EIPS/eip-5749
    alephiumProviders?: Record<string, AlephiumWindowObject>
    ReactNativeWebView: {
      postMessage: (message: string) => void
    }
  }

  interface WindowEventMap {
    announceAlephiumProvider: CustomEvent
    requestAlephiumProvider: Event
  }
}

export const announceProvider = () => {
  const event = new CustomEvent('announceAlephiumProvider', {
    detail: Object.freeze({ provider: alephiumWindowObject })
  })

  const handler = () => window.dispatchEvent(event)

  handler()

  window.addEventListener('requestAlephiumProvider', handler)

  window.addEventListener('message', ({ data }: MessageEvent<MessageType>) => {
    if (data.type === 'ALPH_DISCONNECT_ACCOUNT') alephiumWindowObject.disconnect()
  })
}

export const attachAlephiumProvider = () => {
  window.alephiumProviders =
    window.alephiumProviders && isPlainObject(window.alephiumProviders) ? window.alephiumProviders : {}

  INJECT_NAMES.forEach((name) => {
    // we need 2 different try catch blocks because we want to execute both even if one of them fails
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window.alephiumProviders as any)[name]
    } catch (e) {
      // ignore
    }
    try {
      // set read only property to window
      Object.defineProperty(window.alephiumProviders, name, {
        value: alephiumWindowObject,
        writable: false
      })
    } catch {
      // ignore
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window.alephiumProviders as any)[name] = alephiumWindowObject
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(providerInitializedEvent('alephium')))
  })
}
