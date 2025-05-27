import { createAction } from '@reduxjs/toolkit'

import { AddressBase } from '@/types'
import { DeprecatedWalletMetadataMobile, WalletMetadataMobile } from '@/types/walletMobile'

export const walletLocked = createAction('wallets/walletLocked')

export const activeWalletDeleted = createAction('wallets/activeWalletDeleted')

export const passphraseInitialAddressGenerated = createAction<AddressBase>('wallets/passphraseInitialAddressGenerated')

export const newWalletInitialAddressGenerated = createAction<AddressBase>('wallets/newWalletInitialAddressGenerated')

export const walletUnlockedMobile = createAction<WalletMetadataMobile>('wallets/walletUnlockedMobile')

export const appLaunchedWithLastUsedWallet = createAction<WalletMetadataMobile | DeprecatedWalletMetadataMobile>(
  'wallets/appLaunchedWithLastUsedWallet'
)
