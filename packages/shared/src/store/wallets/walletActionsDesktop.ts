import { createAction } from '@reduxjs/toolkit'

import { ActiveWalletDesktop } from '@/types'

export const walletUnlockedDesktop = createAction<ActiveWalletDesktop>('wallets/walletUnlocked')

export const walletSwitchedDesktop = createAction<ActiveWalletDesktop>('wallets/walletSwitched')
