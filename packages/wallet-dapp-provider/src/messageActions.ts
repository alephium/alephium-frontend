import { MessageType, RequestOptions, WindowMessageType } from './types/messages'

export function sendMessage(msg: MessageType): void {
  return window.ReactNativeWebView.postMessage(JSON.stringify(msg))
}

export function waitForMessage<K extends MessageType['type'], T extends { type: K } & MessageType>(
  type: K,
  timeout: number,
  predicate: (x: T) => boolean = () => true
): Promise<T extends { data: infer S } ? S : undefined> {
  return new Promise((resolve, reject) => {
    const pid = setTimeout(() => reject(new Error('Timeout')), timeout)

    const handler = (event: MessageEvent<WindowMessageType>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (event.data.type === type && predicate(event.data as any)) {
        clearTimeout(pid)
        window.removeEventListener('message', handler)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return resolve('data' in event.data ? (event.data.data as any) : undefined)
      }
    }

    window.addEventListener('message', handler)
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
