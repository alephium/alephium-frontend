import { activeWalletDeleted, appBecameInactive, appReset, walletSwitchedMobile } from '@alephium/shared/store'
import { WalletMetadataMobile } from '@alephium/shared/types'
import { describe, expect, it } from 'vitest'

import backupSlice, { verifiedWordsCountChanged } from '~/features/backup/backupSlice'
import { openModal } from '~/features/modals/modalActions'

type BackupAction = Parameters<typeof backupSlice.reducer>[1]

const walletMetadata = (id: string): WalletMetadataMobile => ({
  id,
  name: id,
  type: 'seed',
  isMnemonicBackedUp: false,
  addresses: [],
  contacts: []
})

const run = (actions: BackupAction[]) =>
  actions.reduce((state, action) => backupSlice.reducer(state, action), backupSlice.getInitialState())

describe('mnemonic verification progress', () => {
  it('remembers how many words were verified', () => {
    const state = run([verifiedWordsCountChanged(20)])

    expect(state.verifiedWordsCount).toBe(20)
  })

  it.each([
    ['the wallet is deleted', activeWalletDeleted()],
    ['the wallet is switched', walletSwitchedMobile(walletMetadata('wallet-b'))],
    ['the app is reset', appReset()],
    ['the app locks', appBecameInactive()]
  ])('forgets the progress when %s', (_, teardownAction) => {
    const state = run([verifiedWordsCountChanged(20), teardownAction])

    expect(state.verifiedWordsCount).toBe(0)
  })

  it('keeps the reminded wallets when the progress is forgotten', () => {
    const state = run([
      openModal({ name: 'BackupReminderModal', props: { isNewWallet: true, walletId: 'wallet-a' } }),
      verifiedWordsCountChanged(20),
      appBecameInactive()
    ])

    expect(state.remindedWalletIds).toEqual(['wallet-a'])
  })
})
