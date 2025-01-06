import { createAction } from '@reduxjs/toolkit'

import { DeprecatedWalletMetadata, GeneratedWallet, WalletMetadata, WalletState } from '~/types/wallet'

export const walletUnlocked = createAction<WalletMetadata>('wallets/walletUnlocked')

export const newWalletGenerated = createAction<GeneratedWallet>('wallets/newWalletGenerated')

export const newWalletImportedWithMetadata = createAction<GeneratedWallet>('wallets/newWalletImportedWithMetadata')

export const walletDeleted = createAction('wallets/walletDeleted')

export const walletNameChanged = createAction<WalletState['name']>('wallets/walletNameChanged')

export const mnemonicMigrated = createAction('wallets/mnemonicMigrated')

export const appLaunchedWithLastUsedWallet = createAction<WalletMetadata | DeprecatedWalletMetadata>(
  'wallets/appLaunchedWithLastUsedWallet'
)
