const walletFundedKey = (walletId: string) => `wallet-funded-${walletId}`

export const getIsWalletFunded = (walletId: string): boolean =>
  window.localStorage.getItem(walletFundedKey(walletId)) === 'true'

export const storeIsWalletFunded = (walletId: string, isFunded: boolean): void =>
  window.localStorage.setItem(walletFundedKey(walletId), String(isFunded))
