import { createAction } from '@reduxjs/toolkit'

import { ActiveWalletDesktop } from '@/types'

export const walletUnlockedDesktop = createAction<ActiveWalletDesktop>('wallets/walletUnlockedDesktop')

export const walletSwitchedDesktop = createAction<ActiveWalletDesktop>('wallets/walletSwitchedDesktop')
