import { createAction } from '@reduxjs/toolkit'

import { AddressBase } from '@/types'

export const walletLocked = createAction('wallets/walletLocked')

export const activeWalletDeleted = createAction('wallets/activeWalletDeleted')

export const passphraseInitialAddressGenerated = createAction<AddressBase>('wallets/passphraseInitialAddressGenerated')

export const newWalletInitialAddressGenerated = createAction<AddressBase>('wallets/newWalletInitialAddressGenerated')
