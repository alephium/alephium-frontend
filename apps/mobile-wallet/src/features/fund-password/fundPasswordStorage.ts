import {
  deleteSecurelyWithReportableError,
  getSecurelyWithReportableError,
  storeSecurelyWithReportableError
} from '~/persistent-storage/utils'

const FUND_PASSWORD_KEY = 'fund-password'

export const storeFundPassword = (password: string) =>
  storeSecurelyWithReportableError(FUND_PASSWORD_KEY, password, true, '')

export const getFundPassword = () => getSecurelyWithReportableError(FUND_PASSWORD_KEY, true, '')

export const hasStoredFundPassword = async () => {
  try {
    return !!(await getFundPassword())
  } catch {
    return false
  }
}

export const deleteFundPassword = async () => {
  await deleteSecurelyWithReportableError(FUND_PASSWORD_KEY, true, '')
}
