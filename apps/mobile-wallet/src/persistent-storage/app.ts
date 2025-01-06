import {
  getSecurelyWithReportableError,
  getWithReportableError,
  storeSecurelyWithReportableError,
  storeWithReportableError
} from '~/persistent-storage/utils'

const INSTALLED_ON = 'app-installed-on'
const INSTALLED_ON_PERSISTENT = 'app-installed-on-persistent'

export const rememberAppInstallation = async () => {
  const timestamp = new Date().getTime().toString()

  await storeWithReportableError(INSTALLED_ON, timestamp)
  await storeSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, timestamp, true, '')
}

export const wasAppUninstalled = async (): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, true, '')) &&
  !(await getWithReportableError(INSTALLED_ON))

export const appInstallationTimestampMissing = async () =>
  !(await getSecurelyWithReportableError(INSTALLED_ON_PERSISTENT, true, ''))
