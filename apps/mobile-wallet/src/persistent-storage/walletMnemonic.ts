import {
  dangerouslyConvertUint8ArrayMnemonicToString,
  keyring,
  mnemonicJsonStringifiedObjectToUint8Array
} from '@alephium/keyring'
import { resetArray } from '@alephium/shared'

import i18n from '~/features/localization/i18n'
import { getSecurelyWithReportableError } from '~/persistent-storage/utils'

export const walletMnemonicKey = (walletId: string) => `wallet-mnemonic-${walletId}`

export const initializeKeyringWithStoredWallet = async (walletId: string) => {
  let decryptedMnemonic = await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')
  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not initialize keyring')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))
  keyring.initFromDecryptedMnemonic(parsedDecryptedMnemonic, '')

  decryptedMnemonic = ''
  resetArray(parsedDecryptedMnemonic)
}

export const dangerouslyExportWalletMnemonic = async (walletId: string): Promise<string> => {
  const decryptedMnemonic = await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, '')

  if (!decryptedMnemonic)
    throw new Error(`${i18n.t('Could not export mnemonic')}: ${i18n.t('Could not find stored wallet')}`)

  const parsedDecryptedMnemonic = mnemonicJsonStringifiedObjectToUint8Array(JSON.parse(decryptedMnemonic))

  return dangerouslyConvertUint8ArrayMnemonicToString(parsedDecryptedMnemonic)
}

export const storedMnemonicExists = async (walletId: string): Promise<boolean> =>
  !!(await getSecurelyWithReportableError(walletMnemonicKey(walletId), true, ''))
