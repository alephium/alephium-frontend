import type { MessageType } from '@alephium/wallet-dapp-provider'

import {
  receivedDappMessage,
  respondedToDappMessage
} from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { dAppMessagesQueueAdapter } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueAdapter'
import dAppMessagesQueueSlice from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueSlice'

const { reducer } = dAppMessagesQueueSlice
const { selectAll } = dAppMessagesQueueAdapter.getSelectors()

const signMessage = (message: string): MessageType => ({
  type: 'ALPH_SIGN_MESSAGE',
  data: { host: 'app.alephium.org', message, signerAddress: '1abc', messageHasher: 'alephium' }
})

describe('dApp messages queue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps both messages when two arrive within the same millisecond', () => {
    let state = reducer(undefined, receivedDappMessage({ message: signMessage('first'), senderHost: 'a.org' }))
    state = reducer(state, receivedDappMessage({ message: signMessage('second'), senderHost: 'a.org' }))

    expect(Date.now()).toBe(new Date('2026-01-01T00:00:00.000Z').getTime())
    expect(selectAll(state)).toHaveLength(2)
    expect(new Set(state.ids).size).toBe(2)
  })

  it('processes messages first in, first out', () => {
    let state = reducer(undefined, receivedDappMessage({ message: signMessage('first'), senderHost: 'a.org' }))
    state = reducer(state, receivedDappMessage({ message: signMessage('second'), senderHost: 'a.org' }))
    state = reducer(state, receivedDappMessage({ message: signMessage('third'), senderHost: 'a.org' }))

    const messageOf = (s: typeof state, index: number) => {
      const entry = selectAll(s).at(index)
      return entry && 'data' in entry ? (entry.data as { message: string }).message : undefined
    }

    expect(messageOf(state, 0)).toBe('first')

    state = reducer(state, respondedToDappMessage(selectAll(state)[0].id))
    expect(messageOf(state, 0)).toBe('second')

    state = reducer(state, respondedToDappMessage(selectAll(state)[0].id))
    expect(messageOf(state, 0)).toBe('third')
  })

  it('ignores an id smuggled into the dApp-controlled message body', () => {
    const forged = { ...signMessage('first'), id: 'attacker-chosen' } as unknown as MessageType
    const state = reducer(undefined, receivedDappMessage({ message: forged, senderHost: 'a.org' }))

    expect(selectAll(state)[0].id).not.toBe('attacker-chosen')
  })
})
