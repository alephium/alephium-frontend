import {
  CORE_STORAGE_OPTIONS,
  CORE_STORAGE_PREFIX,
  HISTORY_CONTEXT,
  HISTORY_STORAGE_VERSION,
  MESSAGES_CONTEXT,
  MESSAGES_STORAGE_VERSION,
  STORE_STORAGE_VERSION
} from '@walletconnect/core'
import { KeyValueStorage } from '@walletconnect/keyvaluestorage'
import SignClient, { REQUEST_CONTEXT, SESSION_CONTEXT, SIGN_CLIENT_STORAGE_PREFIX } from '@walletconnect/sign-client'
import { JsonRpcRecord, MessageRecord, PendingRequestTypes, SessionTypes } from '@walletconnect/types'
import { mapToObj, objToMap } from '@walletconnect/utils'

const MaxRequestNumToKeep = 10

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

// clean the `history` and `messages` storage before `SignClient` init
export async function cleanBeforeInit() {
  console.log('Clean storage before SignClient init')
  const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
  const historyStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, HISTORY_STORAGE_VERSION, HISTORY_CONTEXT)
  // history records are sorted by expiry
  const historyRecords = await storage.getItem<JsonRpcRecord[]>(historyStorageKey)
  if (historyRecords !== undefined) {
    const remainRecords: JsonRpcRecord[] = []
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
    await storage.setItem<JsonRpcRecord[]>(historyStorageKey, remainRecords.reverse())
  }

  await cleanPendingRequest(storage)

  const topics = await getSessionTopics(storage)
  if (topics.length > 0) {
    const messageStorageKey = getWCStorageKey(CORE_STORAGE_PREFIX, MESSAGES_STORAGE_VERSION, MESSAGES_CONTEXT)
    const messages = await storage.getItem<Record<string, MessageRecord>>(messageStorageKey)
    if (messages === undefined) {
      return
    }

    const messagesMap = objToMap(messages)
    topics.forEach((topic) => messagesMap.delete(topic))
    await storage.setItem<Record<string, MessageRecord>>(messageStorageKey, mapToObj(messagesMap))
    console.log(`Clean topics from messages storage: ${topics.join(',')}`)
  }
}

export function cleanHistory(client: SignClient, checkResponse: boolean) {
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
    console.error(`Failed to clean history, error: ${error}`)
  }
}

export async function cleanMessages(client: SignClient, topic: string) {
  try {
    await client.core.relayer.messages.del(topic)
  } catch (error) {
    console.error(`Failed to clean messages, error: ${error}, topic: ${topic}`)
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

export async function clearWCStorage() {
  try {
    const storage = new KeyValueStorage({ ...CORE_STORAGE_OPTIONS })
    const keys = (await storage.getKeys()).filter((key) => key.startsWith('wc@') || key.startsWith('wc_'))
    for (const key of keys) {
      await storage.removeItem(key)
    }
  } catch (error) {
    console.error(`Failed to clear walletconnect storage, error: ${error}`)
  }
}
