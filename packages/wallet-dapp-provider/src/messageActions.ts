import { stringify } from '@alephium/web3'

import { MessageType, RequestOptions } from './types/messages'

export function sendMessage(msg: MessageType): void {
  return window.ReactNativeWebView.postMessage(stringify(msg))
}

export function waitForMessage<K extends MessageType['type'], T extends { type: K } & MessageType>(
  type: K,
  timeout: number,
  predicate: (x: T) => boolean = () => true,
  signal?: AbortSignal
): Promise<T extends { data: infer S } ? S : undefined> {
  return new Promise((resolve, reject) => {
    const pid = setTimeout(() => {
      cleanup()
      reject(new Error('Timeout'))
    }, timeout)

    const cleanup = () => {
      clearTimeout(pid)
      window.removeEventListener('message', onMessage)
      signal?.removeEventListener('abort', onAbort)
    }

    // React Native WebView sends messages as strings so we can't use WindowMessageType
    const onMessage = (event: MessageEvent<string>) => {
      const data = JSON.parse(event.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (data.type === type && predicate(data as any)) {
        cleanup()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return resolve('data' in data ? (data.data as any) : undefined)
      }
    }

    const onAbort = () => cleanup()

    signal?.addEventListener('abort', onAbort, { once: true })
    window.addEventListener('message', onMessage)
  })
}

/** check if current host is pre-authorized against currently selected account */
export const getIsPreauthorized = async (options: RequestOptions) => {
  try {
    sendMessage({
      type: 'ALPH_IS_PREAUTHORIZED',
      data: options
    })
    const isPreauthorized = await waitForMessage('ALPH_IS_PREAUTHORIZED_RES', 1000)
    return isPreauthorized
  } catch (e) {
    // ignore timeout or other error
  }
  return false
}

export const removePreAuthorization = async () => {
  try {
    sendMessage({
      type: 'ALPH_REMOVE_PREAUTHORIZATION',
      data: window.location.host
    })
    await waitForMessage('ALPH_REMOVE_PREAUTHORIZATION_RES', 1000)
  } catch (e) {
    console.error('Remove pre authorization failed', e)
  }
}
