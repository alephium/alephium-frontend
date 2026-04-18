import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError
} from '~/persistent-storage/utils'

const fundPasswordKey = (walletId: string) => `fund-password-${walletId}`

// Legacy key used only by multi-wallet migration
export const LEGACY_FUND_PASSWORD_KEY = 'fund-password'

export const storeFundPassword = (walletId: string, password: string) =>
  storeSecurelyWithReportableError(fundPasswordKey(walletId), password, true, '')

export const getFundPassword = (walletId: string) => getSecurelyWithReportableError(fundPasswordKey(walletId), true, '')

export const hasStoredFundPassword = async (walletId: string) => {
  try {
    return !!(await getFundPassword(walletId))
  } catch {
    return false
  }
}

export const deleteFundPassword = async (walletId: string) => {
  await deleteSecurelyWithReportableError(fundPasswordKey(walletId), true, '')
}
