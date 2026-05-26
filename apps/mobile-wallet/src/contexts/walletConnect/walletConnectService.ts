// All WalletConnect related packages are imported only in this file. Loading code from WC packages is a heavy operation
// which can affect the app's performance. Collecting them all in one module allows for potential lazy loading
// techniques.

import '@walletconnect/react-native-compat'

import { formatChain, type RelayMethod } from '@alephium/walletconnect-provider'
import { IWalletKit, WalletKit } from '@reown/walletkit'
import {
  Core,
  CORE_STORAGE_OPTIONS,
  CORE_STORAGE_PREFIX,
  Expirer,
  HISTORY_CONTEXT,
  HISTORY_STORAGE_VERSION,
  MESSAGES_CONTEXT,
  MESSAGES_STORAGE_VERSION,
  STORE_STORAGE_VERSION
} from '@walletconnect/core'
import type { ErrorResponse } from '@walletconnect/jsonrpc-types'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'
import { REQUEST_CONTEXT, SESSION_CONTEXT, SIGN_CLIENT_STORAGE_PREFIX } from '@walletconnect/sign-client'
import type {
  EngineTypes,
  JsonRpcRecord,
  MessageRecord,
  PendingRequestTypes,
  SessionTypes,
  SignClientTypes
} from '@walletconnect/types'
import { calcExpiry, getSdkError, mapToObj, objToMap } from '@walletconnect/utils'

import { sendAnalytics } from '~/analytics'

export type { EngineTypes, Expirer, IWalletKit, RelayMethod, SessionTypes, SignClientTypes, ErrorResponse }
export { calcExpiry, formatChain, getSdkError }

const WALLETCONNECT_PROJECT_ID = '2a084aa1d7e09af2b9044a524f39afbe'
const MaxRequestNumToKeep = 10

const WALLET_CONNECT_METADATA = {
  name: 'Alephium mobile wallet',
  description: 'Alephium mobile wallet',
  url: 'https://github.com/alephium/alephium-frontend',
  icons: ['https://alephium.org/favicon-32x32.png'],
  redirect: {
    native: 'alephium://'
  }
}

let core: InstanceType<typeof Core> | undefined

const getCore = (): InstanceType<typeof Core> => {
  if (!core) {
    core = new Core({ projectId: WALLETCONNECT_PROJECT_ID })
  }

  return core
}

export async function initWalletConnectClient(): Promise<IWalletKit | undefined> {
  try {
    console.log('CLEANING STORAGE')
    await cleanBeforeInit()
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not clean before initializing WalletConnect client' })
  }

  console.log('⏳ INITIALIZING WC CLIENT...')

  const client = await WalletKit.init({
    core: getCore(),
    metadata: WALLET_CONNECT_METADATA
  })

  if (client) {
    cleanHistory(client, false)
  }

  return client
}

export function getWCStorageKey(prefix: string, version: string, name: string): string {
  return prefix + version + '//' + name
}

export function isApiRequest(record: JsonRpcRecord): boolean {
  const request = record.request
  if (request.method !== 'wc_sessionRequest') {
    return false
  }
  const alphRequestMethod = request.params?.request?.method
  return alphRequestMethod === 'alph_requestNodeApi' || alphRequestMethod === 'alph_requestExplorerApi'
}

export async function getSessionTopics(storage: KeyValueStorage): Promise<string[]> {
  const sessionKey = getWCStorageKey(SIGN_CLIENT_STORAGE_PREFIX, STORE_STORAGE_VERSION, SESSION_CONTEXT)
  const sessions = await storage.getItem<SessionTypes.Struct[]>(sessionKey)
  return sessions === undefined ? [] : sessions.map((session) => session.topic)
}

export async function cleanBeforeInit() {
  console.log('Clean storage before SignClient init')

  let storage: KeyValueStorage | undefined

  try {
    storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Error at creating storage object' })
  }

  if (!storage) return

  const historyStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, HISTORY_STORAGE_VERSION, HISTORY_CONTEXT)

  let historyRecords: JsonRpcRecord[] | undefined

  try {
    historyRecords = await storage.getItem<JsonRpcRecord[]>(historyStorageKey)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Error at getting history records from storage' })
  }

  if (historyRecords !== undefined) {
    const remainRecords: JsonRpcRecord[] = []

    try {
      let alphSignRequestNum = 0
      let unresponsiveRequestNum = 0
      const now = Date.now()

      for (const record of historyRecords.reverse()) {
        const msToExpiry = (record.expiry || 0) * 1000 - now

        if (msToExpiry <= 0) continue

        const requestMethod = record.request.params?.request?.method as string | undefined

        if (requestMethod?.startsWith('alph_sign') && alphSignRequestNum < MaxRequestNumToKeep) {
          remainRecords.push(record)
          alphSignRequestNum += 1
        } else if (
          record.response === undefined &&
          !isApiRequest(record) &&
          unresponsiveRequestNum < MaxRequestNumToKeep
        ) {
          remainRecords.push(record)
          unresponsiveRequestNum += 1
        }
      }
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Error at building remainingRecords array' })
    }

    try {
      await storage.setItem<JsonRpcRecord[]>(historyStorageKey, remainRecords.reverse())
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Error at setting history records to storage' })
    }
  }

  try {
    await cleanPendingRequest(storage)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Error at cleanPendingRequest' })
  }

  let topics: string[] = []

  try {
    topics = await getSessionTopics(storage)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Error at getSessionTopics' })
  }

  if (topics.length > 0) {
    const messageStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, MESSAGES_STORAGE_VERSION, MESSAGES_CONTEXT)

    let messages: Record<string, MessageRecord> | undefined

    try {
      messages = await storage.getItem<Record<string, MessageRecord>>(messageStorageKey)
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Error at getting messages from storage' })
    }

    if (messages === undefined) {
      return
    }

    try {
      const messagesMap = objToMap(messages)
      topics.forEach((topic) => messagesMap.delete(topic))
      await storage.setItem<Record<string, MessageRecord>>(messageStorageKey, mapToObj(messagesMap))
      console.log(`Clean topics from messages storage: ${topics.join(',')}`)
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Error at setting messages to storage' })
    }
  }
}

export function cleanHistory(client: IWalletKit, checkResponse: boolean) {
  try {
    const records = client.core.history.records
    for (const [id, record] of records) {
      if (checkResponse && record.response === undefined) {
        continue
      }
      if (isApiRequest(record)) {
        client.core.history.delete(record.topic, id)
      }
    }
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not clean WalletConnect client history' })
  }
}

export async function cleanMessages(client: IWalletKit, topic: string) {
  try {
    await client.core.relayer.messages.del(topic)
  } catch (error) {
    sendAnalytics({ type: 'error', error, message: 'Could not clean WalletConnect client messages' })
  }
}

export async function cleanPendingRequest(storage: KeyValueStorage) {
  const pendingRequestStorageKey = getWCStorageKey(SIGN_CLIENT_STORAGE_PREFIX, STORE_STORAGE_VERSION, REQUEST_CONTEXT)
  const pendingRequests = await storage.getItem<PendingRequestTypes.Struct[]>(pendingRequestStorageKey)
  if (pendingRequests !== undefined) {
    const remainPendingRequests = pendingRequests.filter((request) => {
      const method = request.params.request.method
      return method !== 'alph_requestNodeApi' && method !== 'alph_requestExplorerApi'
    })
    await storage.setItem<PendingRequestTypes.Struct[]>(pendingRequestStorageKey, remainPendingRequests)
  }
}

export async function clearWCStorage(walletConnectClient?: IWalletKit) {
  if (walletConnectClient) {
    try {
      const keys = (await walletConnectClient.core.storage.getKeys()).filter((key) => key.startsWith('wc@'))

      for (const key of keys) await walletConnectClient.core.storage.removeItem(key)
    } catch (e) {
      console.error('❌ COULD NOT CLEAR WALLETCONNECT STORAGE using walletConnectClient:', e)
    }
  }

  try {
    const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
    const keys = (await storage.getKeys()).filter((key) => key.startsWith('wc@'))

    for (const key of keys) await storage.removeItem(key)
  } catch (e) {
    console.error('❌ COULD NOT CLEAR WALLETCONNECT STORAGE:', e)
  }
}

export function clearWalletConnectRuntimeCache(walletConnectClient: IWalletKit) {
  const expirer = walletConnectClient.core.expirer as Expirer
  expirer.expirations.clear()
  walletConnectClient.core.history.records.clear()
  walletConnectClient.core.crypto.keychain.keychain.clear()
  walletConnectClient.core.relayer.messages.messages.clear()
  walletConnectClient.core.pairing.pairings.map.clear()
  walletConnectClient.core.relayer.subscriber.subscriptions.clear()
}
