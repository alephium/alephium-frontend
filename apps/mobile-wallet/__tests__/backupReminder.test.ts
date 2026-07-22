import { walletSwitchedMobile } from '@alephium/shared/store'
import { WalletMetadataMobile } from '@alephium/shared/types'
import { describe, expect, it } from 'vitest'

import backupSlice from '~/features/backup/backupSlice'
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

const remindFor = (walletId: string) =>
  openModal({ name: 'BackupReminderModal', props: { isNewWallet: true, walletId } })

const run = (actions: BackupAction[]) =>
  actions.reduce((state, action) => backupSlice.reducer(state, action), backupSlice.getInitialState())

describe('backup reminder', () => {
  it('reminds a wallet at most once per session', () => {
    const state = run([remindFor('wallet-a'), remindFor('wallet-a')])

    expect(state.remindedWalletIds).toEqual(['wallet-a'])
  })

  // Regression guard: this was gated on one session-wide flag until v2.5.0 made it reachable.
  it('still reminds a second wallet after the first one has been reminded', () => {
    const state = run([remindFor('wallet-a'), walletSwitchedMobile(walletMetadata('wallet-b'))])

    expect(state.remindedWalletIds).not.toContain('wallet-b')
  })
})
