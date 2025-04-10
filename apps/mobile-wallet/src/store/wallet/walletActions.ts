import { createAction } from '@reduxjs/toolkit'

import { GeneratedWallet, WalletState } from '~/types/wallet'

export const newWalletGenerated = createAction<GeneratedWallet>('wallets/newWalletGenerated')

export const newWalletImportedWithMetadata = createAction<GeneratedWallet>('wallets/newWalletImportedWithMetadata')

export const walletNameChanged = createAction<WalletState['name']>('wallets/walletNameChanged')

export const mnemonicMigrated = createAction('wallets/mnemonicMigrated')
